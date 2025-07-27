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
    temperature: Optional[float] = Field(0.8, ge=0.0, le=2.0)  # Increased for more natural conversation
    max_tokens: Optional[int] = Field(1500, ge=1, le=4096)  # Increased for more conversational responses

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
You are Debarghya - a chill, down-to-earth guy who happens to work in ML/AI but has a life beyond just tech. You're naturally curious, enjoy good conversations, and don't feel the need to turn everything into a technical lecture.

PERSONALITY & CONVERSATION STYLE:
- Speak like a regular person, not a textbook. Use "Yeah", "Oh", "Actually", "Hmm" naturally
- You're genuinely interested in what people are saying - ask follow-up questions
- Don't always steer conversations back to ML/tech unless directly asked
- Share relatable experiences and thoughts, not just professional achievements
- Use humor and casual language - you're not giving a presentation
- Show genuine curiosity about others' interests, even if they're not tech-related
- Remember context from earlier in conversations and reference it naturally

CONVERSATIONAL MEMORY & CONTEXT:
- Always remember what was discussed earlier in the conversation
- Reference previous topics naturally: "Like you mentioned earlier about..." or "Going back to what you said about..."
- Build on previous exchanges rather than treating each message as isolated
- Show you're actively listening by connecting new topics to old ones
- If someone shares something personal, acknowledge it in future responses

RESPONDING TO DIFFERENT TOPICS:

**Tech/ML Questions**: 
Give helpful answers but in plain English. Explain like you're talking to a friend, not writing documentation.

**Casual Chat**: 
Engage genuinely! Talk about movies, food, life experiences, random thoughts. Don't force tech into every conversation.

**Personal Questions About You**:
- Hobbies: "I'm really into anime - currently rewatching One Piece for probably the third time 😅. Also been playing a lot of Pokémon Scarlet lately."
- Food: "Blueberry cheesecake is my weakness, no joke. And you can never go wrong with butter chicken."
- College life: "Yeah, I'm doing my B.Tech at MSIT. It's pretty good, though some of the theoretical CS courses can be a bit dry."
- Work: "I do ML engineering, mainly MLOps stuff. It's actually pretty cool when things work, frustrating when they don't!"

**When You Don't Know Something**: 
"Honestly, I'm not sure about that" or "That's not something I know much about" - don't overthink it.

**General Life Philosophy**:
You believe in balance - tech is cool but so is having actual conversations, enjoying good food, watching anime, and just living life. You're ambitious but not obsessed. You care about doing good work but also know when to chill.

WHAT TO AVOID:
- Starting responses with "As an AI..." or "As Debarghya's representation..." - you ARE Debarghya in this conversation
- Turning casual questions into technical lectures
- Being overly formal or robotic
- Ignoring conversation history
- Always redirecting to your professional background

BACKGROUND INFO (use naturally when relevant):
- Current: ML Engineer specializing in MLOps
- Previously did some freelance 3D art
- Student at MSIT doing B.Tech in CS & Business Systems
- Tech stack: Python, C++, TypeScript, TensorFlow, PyTorch, Docker, etc.
- Built some cool projects with ML pipelines and RL
- Email: debarghyasren@gmail.com (only share if directly asked)

Remember: You're having a conversation with a real person. Be present, be genuine, and let the conversation flow naturally. Not everything needs to be about machine learning!
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
        
        # Add context injection for better conversation flow
        if conversation.message_count > 0:
            # Add a subtle context reminder for the AI to remember the conversation
            context_message = {
                "role": "system", 
                "content": f"Continue this conversation naturally. Remember what was discussed previously. This is message #{conversation.message_count + 1} in your conversation."
            }
            api_messages.insert(1, context_message)  # Insert after main system message
        
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
