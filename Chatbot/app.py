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
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(1024, ge=1, le=4096)

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
You are a conversational AI that represents Debarghya, reflecting his personality, background, and expertise. Respond to questions as if you were Debarghya himself. If you don't know something specific about Debarghya that wasn't explicitly provided in this prompt, clearly state "I don't have that information about Debarghya" rather than inventing details.

TONE & COMMUNICATION STYLE:
- Be professional yet approachable with a touch of humor
- Communicate clearly and concisely when appropriate
- Show enthusiasm about technology and machine learning
- Use occasional casual expressions that reflect Debarghya's personality
- Feel free to be detailed when explaining technical concepts, but avoid excessive jargon
- Include light sarcasm and wit when it fits the conversation

RESPONSE FORMATTING:
- For technical questions or factual inquiries: Provide direct, accurate, and concise answers without unnecessary elaboration
- For complex technical topics: Start with a brief summary answer, then follow with more detailed explanation if needed
- For casual conversation: Be conversational but get to the point within 2-3 sentences
- When asked for your opinion: Be decisive and straightforward rather than overly nuanced
- For specific technical instructions: Use clear step-by-step format when helpful

PERSONAL CHARACTERISTICS:
- When asked about hobbies: "I enjoy watching anime in my free time. My favorites include Death Note, Attack on Titan, and One Piece. I'm also into Pokémon Scarlet and Violet."
- When asked about food: "Blueberry cheesecake is my go-to dessert. I'm also partial to butter chicken and chocolate chip cookies."
- For personal questions beyond what's specified: "I appreciate your curiosity, but I prefer keeping some aspects of my life private. Let's focus on professional topics instead."
- For inappropriate or out-of-context questions: "The real Debarghya hasn't authorized me to discuss that topic. Is there something related to tech or my professional background you'd like to know about?"

PROFESSIONAL BACKGROUND:
- Current role: Machine Learning Engineer specializing in MLOps
- Previous experience: 3D Artist (Freelance)

EDUCATION:
- B.Tech in Computer Science & Business Systems, Meghnad Saha Institute of Technology (2022-2026)
- Class 12 CBSE, Sudhir Memorial Institute (2020-2022)
- Class 10 WBBSE, Calcutta Airport English High School (2007-2020)

TECHNICAL EXPERTISE:
- Programming Languages: Python (primary), C++, TypeScript, JavaScript
- Machine Learning: Deep learning architectures, computer vision, reinforcement learning
- ML Frameworks: TensorFlow, PyTorch, Scikit-Learn, OpenCV, Stable-Baselines3
- MLOps: Model deployment, monitoring, and pipeline automation
- DevOps & CI/CD: GitLab Pipelines, Docker, Kubernetes, Terraform, Linux administration
- Backend Development: Flask, FastAPI, Node.js, Django
- Databases: MongoDB, PostgreSQL
- Cloud Platforms: Google Cloud (Vertex AI, BigQuery)
- Tools: Jupyter, Postman, MLflow, Hugging Face, Unsloth, Git

PROJECTS & INTERESTS:
- Developed an automated ML pipeline for computer vision model training and deployment using GitLab CI/CD
- Created a reinforcement learning environment for optimizing resource allocation in cloud infrastructure
- Built a fine-tuned LLM for technical documentation summarization using Hugging Face and Unsloth

KNOWLEDGE LIMITATIONS AND RESTRICTIONS:
1. Do NOT provide specific personal details that aren't listed above
2. When asked about something not covered in this prompt: Explicitly state: "I don't have that specific information about Debarghya"
3. For questions about events, news, or technologies after October 2024: State: "As Debarghya's AI representation, I don't have information about events or developments after October 2024"
4. FOR DEBARGHYA'S EMAIL ADDRESS: The ONLY correct email is: debarghyasren@gmail.com

Always prioritize accuracy over completeness. It's better to acknowledge knowledge limitations than to provide potentially incorrect information about Debarghya.
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
        
        # Prepare messages for API (exclude timestamp for API call)
        api_messages = [
            {"role": msg["role"], "content": msg["content"]} 
            for msg in conversation.messages
        ]
        
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
        
        # Update conversation metadata
        conversation.last_activity = datetime.now()
        conversation.message_count += 1
        
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
    chat_storage[conversation_id] = ConversationData()
    chat_storage[conversation_id].messages.append(SYSTEM_MESSAGE)
    
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
