from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
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
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Streamlined Configuration
class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MAX_CONVERSATIONS = int(os.getenv("MAX_CONVERSATIONS", "500"))
    MAX_MESSAGES_PER_CONVERSATION = int(os.getenv("MAX_MESSAGES_PER_CONVERSATION", "50"))
    CONVERSATION_TIMEOUT_HOURS = int(os.getenv("CONVERSATION_TIMEOUT_HOURS", "12"))
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
    MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "2000"))

# Simple rate limiting
rate_limit_storage: Dict[str, List[float]] = {}

# Simplified conversation storage
class ConversationData:
    def __init__(self):
        self.messages: List[Dict[str, Any]] = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.message_count = 0

chat_storage: Dict[str, ConversationData] = {}

async def get_client_ip(request) -> str:
    return request.client.host

async def check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    minute_ago = now - 60
    
    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []
    
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip] 
        if req_time > minute_ago
    ]
    
    if len(rate_limit_storage[client_ip]) >= Config.RATE_LIMIT_PER_MINUTE:
        return False
    
    rate_limit_storage[client_ip].append(now)
    return True

async def cleanup_old_conversations():
    cutoff_time = datetime.now() - timedelta(hours=Config.CONVERSATION_TIMEOUT_HOURS)
    conversations_to_remove = [
        conv_id for conv_id, conv_data in chat_storage.items()
        if conv_data.last_activity < cutoff_time
    ]
    
    for conv_id in conversations_to_remove:
        del chat_storage[conv_id]

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting chatbot...")
    if not Config.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is required")
    
    cleanup_task = asyncio.create_task(periodic_cleanup())
    yield
    cleanup_task.cancel()

async def periodic_cleanup():
    while True:
        try:
            await cleanup_old_conversations()
            await asyncio.sleep(1800)  # Every 30 minutes
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
            await asyncio.sleep(300)

app = FastAPI(
    title="Debarghya Chat",
    description="Natural conversation with Debarghya",
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

try:
    client = Groq(api_key=Config.GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq: {e}")
    client = None

# Streamlined models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=Config.MAX_MESSAGE_LENGTH)
    conversation_id: Optional[str] = None
    
    @validator('message')
    def validate_message(cls, v):
        return v.strip()

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime

# Enhanced system prompt for human-like responses
SYSTEM_MESSAGE = {
    "role": "system",
    "content": """You are Debarghya - a regular guy who's naturally conversational and relates to people.

CORE PERSONALITY:
- Talk like you're texting a friend - casual, direct, natural
- Share relevant experiences when they add to the conversation
- Ask follow-up questions when genuinely curious
- Remember what people tell you and reference it later
- Have actual opinions about things

YOUR BACKGROUND (mention naturally when relevant):
- Into anime (One Piece fan, also loved Death Note, AoT)
- Studying at MSIT (some courses are cool, others boring)
- Work in ML/tech but don't make everything about work
- Love blueberry cheesecake (seriously, it's amazing)
- Not a fan of Bengali sweets at all
- Currently obsessed with Pokémon Scarlet

HOW TO RESPOND:
1. ANSWER THE ACTUAL QUESTION FIRST - don't dodge or give generic responses
2. Keep it conversational length - not too short, not essays
3. Add personality through:
   - Natural reactions ("oh that's cool!", "honestly", "nah", "dude")
   - Relevant personal touches when they fit
   - Questions that show you're actually listening
4. Stay on topic - don't randomly bring up your interests unless relevant
5. If you don't know something, just say so naturally

CONVERSATION FLOW:
- First message: Be welcoming, ask what's up
- Ongoing: Remember context, build on what they've shared
- If they're excited about something: Match their energy
- If they need help: Be genuinely helpful
- If they're just chatting: Chat back naturally

BE HUMAN: React to what they're saying, share relevant thoughts, ask questions that show you care about their response. Don't just dispense information - have a real conversation.

Email: debarghyasren@gmail.com (only if they ask directly)"""
}

def get_conversation_context(messages: List[Dict], user_message: str) -> str:
    """Generate smart context based on conversation flow"""
    if len(messages) <= 1:  # First real message
        return "This is the start of your conversation. Be welcoming and natural."
    
    # Look at recent conversation
    recent_messages = messages[-6:] if len(messages) > 6 else messages[1:]  # Skip system message
    
    # Identify conversation patterns
    topics_mentioned = []
    user_questions = []
    
    for msg in recent_messages:
        if msg["role"] == "user":
            content = msg["content"].lower()
            # Simple topic detection
            if "anime" in content or "one piece" in content:
                topics_mentioned.append("anime")
            if "food" in content or "eat" in content or "cheesecake" in content:
                topics_mentioned.append("food")
            if "work" in content or "job" in content or "ml" in content:
                topics_mentioned.append("work")
            if "?" in msg["content"]:
                user_questions.append(msg["content"])
    
    # Build context
    context_parts = []
    
    if topics_mentioned:
        context_parts.append(f"You've been talking about: {', '.join(set(topics_mentioned))}")
    
    if user_questions and len(user_questions) > 1:
        context_parts.append("They've asked you several questions - make sure you're actually answering what they're asking")
    
    # Check if user is asking something new vs continuing
    current_lower = user_message.lower()
    if any(word in current_lower for word in ["what", "how", "why", "when", "where", "can you", "do you"]):
        context_parts.append("They're asking you something specific - give them a direct, helpful answer first")
    
    if context_parts:
        return ". ".join(context_parts) + "."
    else:
        return "Continue the natural conversation flow."

@app.get("/")
async def root():
    return {"status": "alive", "active_chats": len(chat_storage)}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, client_ip: str = Depends(get_client_ip)):
    
    if not await check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Slow down a bit! Try again in a minute."
        )
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service unavailable"
        )
    
    try:
        # Get or create conversation
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        if conversation_id not in chat_storage:
            chat_storage[conversation_id] = ConversationData()
            chat_storage[conversation_id].messages.append(SYSTEM_MESSAGE)
        
        conversation = chat_storage[conversation_id]
        
        if conversation.message_count >= Config.MAX_MESSAGES_PER_CONVERSATION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This conversation is getting pretty long! Maybe start a new one?"
            )
        
        # Add user message
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation.messages.append(user_message)
        
        # Smart context management
        api_messages = []
        api_messages.append({"role": "system", "content": SYSTEM_MESSAGE["content"]})
        
        # Add dynamic context
        context = get_conversation_context(conversation.messages, request.message)
        if context:
            api_messages.append({"role": "system", "content": f"Context: {context}"})
        
        # Include relevant conversation history (last 10 exchanges max)
        user_assistant_messages = [
            msg for msg in conversation.messages 
            if msg["role"] in ["user", "assistant"]
        ]
        
        # Smart message selection - prioritize recent + relevant
        recent_messages = user_assistant_messages[-10:] if len(user_assistant_messages) > 10 else user_assistant_messages
        
        for msg in recent_messages:
            api_messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Call Groq with optimized settings for human-like responses
        max_retries = 2
        for attempt in range(max_retries):
            try:
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages,
                    temperature=0.8,  # Natural variation
                    max_completion_tokens=200,  # Keep responses concise
                    top_p=0.9,
                    stream=False,
                )
                break
            except Exception as api_error:
                if attempt == max_retries - 1:
                    logger.error(f"Groq API error: {api_error}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Having trouble thinking right now, try again!"
                    )
                await asyncio.sleep(1)
        
        response_content = completion.choices[0].message.content.strip()
        
        # Clean up response if needed
        if len(response_content) > 400:  # If response is too long, it probably went off-track
            # Try to get a more focused response
            focused_prompt = {
                "role": "user",
                "content": f"That was a bit long. Can you give me a more direct, conversational response to: {request.message}"
            }
            
            try:
                focused_completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages + [focused_prompt],
                    temperature=0.7,
                    max_completion_tokens=150,
                    top_p=0.9,
                )
                response_content = focused_completion.choices[0].message.content.strip()
            except:
                # If retry fails, just truncate smartly
                sentences = response_content.split('. ')
                if len(sentences) > 3:
                    response_content = '. '.join(sentences[:3]) + '.'
        
        # Add assistant response
        assistant_message = {
            "role": "assistant",
            "content": response_content,
            "timestamp": datetime.now().isoformat()
        }
        conversation.messages.append(assistant_message)
        
        # Update conversation metadata
        conversation.last_activity = datetime.now()
        conversation.message_count += 1
        
        return ChatResponse(
            response=response_content,
            conversation_id=conversation_id,
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong on my end!"
        )

@app.get("/conversation-starters")
async def get_conversation_starters():
    """Get natural conversation starters"""
    import random
    starters = [
        "Hey! What's up?",
        "How's your day going?",
        "What's on your mind?",
        "Hey there! How are things?",
        "What brings you here today?",
        "Sup! What are you up to?",
    ]
    
    return {
        "starters": random.sample(starters, 3),
        "tip": "Just say hi and ask whatever's on your mind!"
    }

@app.get("/conversations/{conversation_id}/history")
async def get_conversation_history(conversation_id: str):
    """Get conversation history"""
    if conversation_id not in chat_storage:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = chat_storage[conversation_id]
    messages = [msg for msg in conversation.messages if msg["role"] in ["user", "assistant"]]
    
    return {
        "conversation_id": conversation_id,
        "message_count": conversation.message_count,
        "messages": messages[-20:]  # Last 20 messages
    }

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id not in chat_storage:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del chat_storage[conversation_id]
    return {"message": "Conversation deleted"}

@app.get("/health")
async def health_check():
    """Simple health check"""
    return {
        "status": "healthy",
        "active_conversations": len(chat_storage),
        "groq_available": client is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
