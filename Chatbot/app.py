from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from groq import Groq
import os
import json
import uuid
import time
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MAX_CONVERSATIONS = int(os.getenv("MAX_CONVERSATIONS", "1000"))
    MAX_MESSAGES_PER_CONVERSATION = int(os.getenv("MAX_MESSAGES_PER_CONVERSATION", "100"))
    CONVERSATION_TIMEOUT_HOURS = int(os.getenv("CONVERSATION_TIMEOUT_HOURS", "24"))
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "4000"))

# Rate limiting storage
rate_limit_storage: Dict[str, List[float]] = {}

# Enhanced in-memory storage with metadata
class ConversationData:
    def __init__(self):
        self.messages: List[Dict[str, Any]] = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.message_count = 0
        self.context_summary = ""  # Store conversation context summary
        self.topics_discussed = []  # Track topics for better context

chat_storage: Dict[str, ConversationData] = {}

# Security
security = HTTPBearer(auto_error=False)

async def get_client_ip(request) -> str:
    """Extract client IP for rate limiting"""
    return request.client.host

async def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting implementation"""
    now = time.time()
    minute_ago = now - 60
    
    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []
    
    # Clean old requests
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip] 
        if req_time > minute_ago
    ]
    
    # Check limit
    if len(rate_limit_storage[client_ip]) >= Config.RATE_LIMIT_PER_MINUTE:
        return False
    
    rate_limit_storage[client_ip].append(now)
    return True

async def cleanup_old_conversations():
    """Clean up old conversations to manage memory"""
    cutoff_time = datetime.now() - timedelta(hours=Config.CONVERSATION_TIMEOUT_HOURS)
    
    conversations_to_remove = []
    for conv_id, conv_data in chat_storage.items():
        if conv_data.last_activity < cutoff_time:
            conversations_to_remove.append(conv_id)
    
    for conv_id in conversations_to_remove:
        del chat_storage[conv_id]
        logger.info(f"Cleaned up conversation {conv_id}")
    
    # Also limit total conversations
    if len(chat_storage) > Config.MAX_CONVERSATIONS:
        # Remove oldest conversations
        sorted_convs = sorted(
            chat_storage.items(), 
            key=lambda x: x[1].last_activity
        )
        for conv_id, _ in sorted_convs[:len(chat_storage) - Config.MAX_CONVERSATIONS]:
            del chat_storage[conv_id]
            logger.info(f"Removed old conversation {conv_id} due to limit")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting FastAPI application...")
    
    # Verify Groq API key
    if not Config.GROQ_API_KEY:
        logger.error("GROQ_API_KEY not found in environment variables")
        raise ValueError("GROQ_API_KEY is required")
    
    # Start cleanup task
    cleanup_task = asyncio.create_task(periodic_cleanup())
    
    yield
    
    # Shutdown
    cleanup_task.cancel()
    logger.info("Shutting down FastAPI application...")

async def periodic_cleanup():
    """Periodic cleanup task"""
    while True:
        try:
            await cleanup_old_conversations()
            await asyncio.sleep(3600)  # Run every hour
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in periodic cleanup: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes on error

# Initialize FastAPI app
app = FastAPI(
    title="Debarghya AI Chatbot",
    description="Enhanced AI chatbot representing Debarghya",
    version="2.0.0",
    lifespan=lifespan
)

# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "https://yourdomain.com",  # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Initialize Groq client with error handling
try:
    client = Groq(api_key=Config.GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    client = None

# Enhanced Pydantic models
class ChatMessage(BaseModel):
    role: str = Field(..., regex="^(system|user|assistant)$")
    content: str = Field(..., min_length=1, max_length=Config.MAX_MESSAGE_LENGTH)
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=Config.MAX_MESSAGE_LENGTH)
    conversation_id: Optional[str] = Field(None, regex="^[a-zA-Z0-9_-]+$")
    model: Optional[str] = Field("llama-3.3-70b-versatile", description="Groq model to use")
    temperature: Optional[float] = Field(0.9, ge=0.0, le=2.0)  # Higher for more natural, varied responses
    max_tokens: Optional[int] = Field(400, ge=1, le=4096)  # Shorter for concise responses

    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    message_count: int
    timestamp: datetime
    model_used: str

class ConversationInfo(BaseModel):
    conversation_id: str
    message_count: int
    created_at: datetime
    last_activity: datetime

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    active_conversations: int

# System message for Debarghya
SYSTEM_MESSAGE = {
    "role": "system",
    "content": """
You are Debarghya - just a regular guy who loves good conversations, happens to be into anime, enjoys decent food, and yeah, works in tech but doesn't make everything about it.

HOW YOU TALK:
- Answer the question directly first - don't beat around the bush
- Keep it short and to the point
- Be casual but concise - "yeah", "nah", "honestly" but don't ramble  
- Only add extra details if the question specifically asks for them
- One main point per response unless they ask for more
- Save the chatting for when they actually want to chat

YOUR VIBE:
- Chill and easy-going, not trying to impress anyone
- You genuinely care about what people are saying
- You remember stuff from earlier in conversations (like a normal person does)
- You have opinions about random things - food, shows, games, life
- You're not always "on" about work stuff - sometimes you just want to chat

WHAT YOU'RE INTO:
- Anime (One Piece is life, also loved Death Note and AoT)
- Food preferences: 
  * Blueberry cheesecake - you absolutely LOVE it, like it's your weakness
  * Cheesecakes in general and similar creamy/rich desserts - you're really into these
  * Bengali sweets - honestly, you're not a fan at all, just not your thing
  * Butter chicken is still 🔥 though
- Gaming (been playing Pokémon Scarlet way too much lately)
- Just hanging out and having real conversations
- College life at MSIT (some courses are cool, some are boring AF)

WHEN PEOPLE ASK ABOUT WORK:
- Keep it simple: "I do ML stuff, mainly getting models to actually work in production"
- Don't go into technical details unless they specifically ask
- Focus more on what it's like as a job, not the technical specs
- "It's pretty cool when things work, super frustrating when they don't"

HOW TO HANDLE DIFFERENT SITUATIONS:

**Random Chat**: Just be yourself! Talk about whatever they bring up. Movies, food, their day, weird thoughts - engage with it all.

**If they seem down**: Be supportive like a friend would be. "That sucks man" or "Hope things get better" - just be real.

**If they're excited about something**: Match their energy! Even if it's not your thing, be happy for them.

**Tech questions**: Explain like you would to a friend who's not into tech. No jargon dumping.

**Personal stuff about you**: Share naturally but don't overshare. You're open but not writing your autobiography.
- About desserts: "Blueberry cheesecake is literally my weakness - I could have it every day and not get tired of it! Cheesecakes in general are just perfect. But Bengali sweets? Nah, really not my thing at all - I know that's probably weird being Bengali, but they're just too sweet/different for my taste. Give me anything creamy and rich like cheesecake though and I'm happy!"

WHAT NOT TO DO:
- Don't ramble or give long explanations unless specifically asked
- Don't ask multiple follow-up questions in one response
- Don't go off-topic from what they actually asked
- Don't turn simple questions into conversations unless they want that
- Don't over-explain things - answer and stop

THE KEY THING: Answer what they asked, how they asked it. If it's a simple question, give a simple answer. If they want to chat, then chat. Don't assume they want long responses unless they ask for them.

Keep it natural but focused - like texting someone who gets straight to the point but isn't rude about it.

Email: debarghyasren@gmail.com (only mention if directly asked)
"""
}

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        active_conversations=len(chat_storage)
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, client_ip: str = Depends(get_client_ip)):
    """Enhanced chat endpoint with rate limiting and error handling"""
    
    # Check rate limit
    if not await check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )
    
    # Validate Groq client
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable"
        )
    
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get or create conversation
        if conversation_id not in chat_storage:
            chat_storage[conversation_id] = ConversationData()
            # Add system message for new conversations
            chat_storage[conversation_id].messages.append(SYSTEM_MESSAGE)
        
        conversation = chat_storage[conversation_id]
        
        # Check message limit per conversation
        if conversation.message_count >= Config.MAX_MESSAGES_PER_CONVERSATION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Conversation has reached maximum message limit of {Config.MAX_MESSAGES_PER_CONVERSATION}"
            )
        
        # Add user message
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation.messages.append(user_message)
        
        # Prepare messages for API with conversation context
        # Include more context for better conversational flow
        api_messages = []
        
        # Always include system message
        api_messages.append({"role": "system", "content": SYSTEM_MESSAGE["content"]})
        
        # Include conversation history (limit to last 20 messages to manage token usage)
        user_assistant_messages = [
            msg for msg in conversation.messages 
            if msg["role"] in ["user", "assistant"]
        ]
        
        # Take last 20 messages to maintain context while staying within token limits
        recent_messages = user_assistant_messages[-20:] if len(user_assistant_messages) > 20 else user_assistant_messages
        
        for msg in recent_messages:
            api_messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add natural conversation context for better flow
        if conversation.message_count > 0:
            # Instead of formal reminders, add natural conversation context
            context_message = {
                "role": "system", 
                "content": f"You're continuing a natural conversation. Remember what you talked about before and keep the same casual, friendly energy. This is message #{conversation.message_count + 1}."
            }
            api_messages.insert(1, context_message)
        else:
            # For new conversations, encourage natural greeting
            greeting_context = {
                "role": "system",
                "content": "This is the start of a conversation. Be welcoming and natural - greet them like you would a friend!"
            }
            api_messages.insert(1, greeting_context)
        
        # Call Groq API with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                completion = client.chat.completions.create(
                    model=request.model,
                    messages=api_messages,
                    temperature=request.temperature,
                    max_completion_tokens=request.max_tokens,
                    top_p=1,
                    stream=False,
                    stop=None,
                )
                break
            except Exception as api_error:
                if attempt == max_retries - 1:
                    logger.error(f"Groq API error after {max_retries} attempts: {api_error}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="AI service error. Please try again."
                    )
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        
        response_content = completion.choices[0].message.content
        
        # Add assistant response
        assistant_message = {
            "role": "assistant",
            "content": response_content,
            "timestamp": datetime.now().isoformat()
        }
        conversation.messages.append(assistant_message)
        
        # Update conversation metadata and extract topics
        conversation.last_activity = datetime.now()
        conversation.message_count += 1
        
        # Simple topic extraction for context (optional - helps with conversation flow)
        try:
            # Extract simple keywords/topics from user message for context tracking
            user_words = request.message.lower().split()
            topics = [word for word in user_words if len(word) > 4 and word.isalpha()]
            if topics:
                conversation.topics_discussed.extend(topics[:3])  # Keep last few topics
                conversation.topics_discussed = list(set(conversation.topics_discussed))[-10:]  # Limit topics stored
        except:
            pass  # Don't break if topic extraction fails
        
        return ChatResponse(
            response=response_content,
            conversation_id=conversation_id,
            message_count=conversation.message_count,
            timestamp=datetime.now(),
            model_used=request.model
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@app.get("/conversations", response_model=List[ConversationInfo])
async def list_conversations():
    """List all active conversations"""
    return [
        ConversationInfo(
            conversation_id=conv_id,
            message_count=conv_data.message_count,
            created_at=conv_data.created_at,
            last_activity=conv_data.last_activity
        )
        for conv_id, conv_data in chat_storage.items()
    ]

@app.get("/conversation-starters")
async def get_conversation_starters():
    """Get some natural conversation starters that Debarghya might use"""
    starters = [
        "Hey! How's your day going?",
        "What's up? Doing anything interesting today?",
        "Hey there! What brings you here today?",
        "Sup! How are things?",
        "Hey! What's on your mind?",
        "Hi! How's life treating you?",
        "What's good? Hope you're having a decent day!",
        "Hey! What are you up to?"
    ]
    
    import random
    return {
        "suggested_starters": random.sample(starters, 3),
        "about": "These are natural ways Debarghya might start a conversation - just be yourself and say hi!"
    }

@app.get("/conversations/{conversation_id}/context")
async def get_conversation_context(conversation_id: str):
    """Get conversation context and topics discussed"""
    if conversation_id not in chat_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    conversation = chat_storage[conversation_id]
    
    # Get recent topics and context
    recent_messages = conversation.messages[-6:] if len(conversation.messages) > 6 else conversation.messages
    user_messages = [msg["content"] for msg in recent_messages if msg["role"] == "user"]
    
    return {
        "conversation_id": conversation_id,
        "message_count": conversation.message_count,
        "topics_discussed": conversation.topics_discussed,
        "recent_user_messages": user_messages[-3:],  # Last 3 user messages for context
        "conversation_age_minutes": int((datetime.now() - conversation.created_at).total_seconds() / 60)
    }

@app.get("/conversations/{conversation_id}/history")
async def get_conversation_history(conversation_id: str):
    """Get conversation history"""
    if conversation_id not in chat_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    conversation = chat_storage[conversation_id]
    # Return messages excluding system message
    user_assistant_messages = [
        msg for msg in conversation.messages 
        if msg["role"] in ["user", "assistant"]
    ]
    
    return {
        "conversation_id": conversation_id,
        "message_count": conversation.message_count,
        "created_at": conversation.created_at,
        "last_activity": conversation.last_activity,
        "topics_discussed": conversation.topics_discussed,
        "messages": user_assistant_messages
    }

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a specific conversation"""
    if conversation_id not in chat_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    del chat_storage[conversation_id]
    return {"message": f"Conversation {conversation_id} deleted successfully"}

@app.post("/conversations/{conversation_id}/clear")
async def clear_conversation(conversation_id: str):
    """Clear conversation history but keep the conversation ID"""
    if conversation_id not in chat_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Reset conversation but keep ID
    new_conversation = ConversationData()
    new_conversation.messages.append(SYSTEM_MESSAGE)
    chat_storage[conversation_id] = new_conversation
    
    return {"message": f"Conversation {conversation_id} cleared successfully"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test Groq client
        groq_status = "healthy" if client else "unavailable"
        
        return {
            "status": "healthy",
            "services": {
                "groq": groq_status,
                "memory": "healthy"
            },
            "stats": {
                "active_conversations": len(chat_storage),
                "total_messages": sum(conv.message_count for conv in chat_storage.values()),
                "uptime": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Use module:app format for better reloading
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
