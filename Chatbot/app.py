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
import numpy as np
import pickle
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration
class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MAX_CONVERSATIONS = int(os.getenv("MAX_CONVERSATIONS", "500"))
    MAX_MESSAGES_PER_CONVERSATION = int(os.getenv("MAX_MESSAGES_PER_CONVERSATION", "50"))
    CONVERSATION_TIMEOUT_HOURS = int(os.getenv("CONVERSATION_TIMEOUT_HOURS", "12"))
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
    MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "2000"))
    
    # RAG Configuration
    SENTENCE_TRANSFORMER_MODEL = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "250"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))
    PDF_DIRECTORY = os.getenv("PDF_DIRECTORY", "./pdfs")
    CACHE_DIRECTORY = os.getenv("CACHE_DIRECTORY", "./rag_cache")

# Global storage
rate_limit_storage: Dict[str, List[float]] = {}
chat_storage: Dict[str, Any] = {}

# RAG System Storage
rag_documents: List[Dict] = []
rag_embeddings: Optional[np.ndarray] = None
rag_chunks: List[Dict] = []
sentence_encoder: Optional[SentenceTransformer] = None
document_converter: Optional[DocumentConverter] = None

# Conversation data class
class ConversationData:
    def __init__(self):
        self.messages: List[Dict[str, Any]] = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.message_count = 0

# RAG Functions
def initialize_rag_system():
    """Initialize the RAG system components"""
    global sentence_encoder, document_converter
    
    logger.info("Initializing RAG system...")
    
    # Initialize sentence transformer
    try:
        sentence_encoder = SentenceTransformer(Config.SENTENCE_TRANSFORMER_MODEL)
        logger.info(f"Loaded sentence transformer: {Config.SENTENCE_TRANSFORMER_MODEL}")
    except Exception as e:
        logger.error(f"Failed to load sentence transformer: {e}")
        sentence_encoder = None
    
    # Initialize docling converter
    try:
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = True
        pipeline_options.do_table_structure = True
        
        document_converter = DocumentConverter(
            format_options={InputFormat.PDF: pipeline_options}
        )
        logger.info("Initialized docling PDF converter")
    except Exception as e:
        logger.error(f"Failed to initialize docling: {e}")
        document_converter = None

def process_pdf(pdf_path: str, doc_id: str = None) -> Dict:
    """Process PDF using docling"""
    if not document_converter:
        raise Exception("Document converter not initialized")
    
    if doc_id is None:
        doc_id = Path(pdf_path).stem
    
    logger.info(f"Processing PDF: {pdf_path}")
    
    try:
        result = document_converter.convert(pdf_path)
        
        doc_data = {
            "doc_id": doc_id,
            "title": getattr(result.document, 'title', doc_id),
            "full_text": result.document.export_to_markdown(),
            "metadata": {
                "source": pdf_path,
                "page_count": len(result.document.pages) if hasattr(result.document, 'pages') else 0
            }
        }
        
        logger.info(f"Successfully processed PDF: {doc_id}")
        return doc_data
        
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_path}: {e}")
        raise

def create_chunks(text: str, doc_id: str) -> List[Dict]:
    """Create overlapping text chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), Config.CHUNK_SIZE - Config.CHUNK_OVERLAP):
        chunk_words = words[i:i + Config.CHUNK_SIZE]
        chunk_text = " ".join(chunk_words)
        
        if chunk_text.strip():
            chunks.append({
                "text": chunk_text,
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}_chunk_{len(chunks)}",
                "start_word": i,
                "end_word": min(i + Config.CHUNK_SIZE, len(words))
            })
    
    return chunks

def add_document_to_rag(pdf_path: str, doc_id: str = None):
    """Add a PDF document to the RAG system"""
    global rag_documents, rag_chunks, rag_embeddings
    
    if not sentence_encoder:
        raise Exception("Sentence encoder not initialized")
    
    # Process PDF
    doc_data = process_pdf(pdf_path, doc_id)
    rag_documents.append(doc_data)
    
    # Create chunks
    doc_chunks = create_chunks(doc_data["full_text"], doc_data["doc_id"])
    rag_chunks.extend(doc_chunks)
    
    # Generate embeddings
    chunk_texts = [chunk["text"] for chunk in doc_chunks]
    if chunk_texts:
        logger.info(f"Generating embeddings for {len(chunk_texts)} chunks")
        new_embeddings = sentence_encoder.encode(chunk_texts, show_progress_bar=True)
        
        if rag_embeddings is None:
            rag_embeddings = new_embeddings
        else:
            rag_embeddings = np.vstack([rag_embeddings, new_embeddings])
    
    logger.info(f"Added document {doc_data['doc_id']} with {len(doc_chunks)} chunks")

def search_rag(query: str, top_k: int = 3, similarity_threshold: float = 0.3) -> List[Dict]:
    """Search for relevant chunks using semantic similarity"""
    global rag_embeddings, rag_chunks, sentence_encoder
    
    if rag_embeddings is None or len(rag_chunks) == 0 or not sentence_encoder:
        return []
    
    # Encode query
    query_embedding = sentence_encoder.encode([query])
    
    # Calculate similarities
    similarities = cosine_similarity(query_embedding, rag_embeddings)[0]
    
    # Get top results above threshold
    results = []
    for idx, similarity in enumerate(similarities):
        if similarity >= similarity_threshold:
            chunk = rag_chunks[idx].copy()
            chunk["similarity"] = float(similarity)
            results.append(chunk)
    
    # Sort by similarity and return top_k
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

def get_context_for_query(query: str, max_context_length: int = 800) -> str:
    """Get formatted context for a query"""
    search_results = search_rag(query, top_k=5)
    
    if not search_results:
        return ""
    
    # Format context
    context_parts = []
    current_length = 0
    
    for result in search_results:
        chunk_text = result["text"]
        similarity = result["similarity"]
        
        # Add chunk if it fits within length limit
        if current_length + len(chunk_text) <= max_context_length:
            context_parts.append(f"[Relevance: {similarity:.2f}] {chunk_text}")
            current_length += len(chunk_text)
        else:
            # Truncate the last chunk to fit
            remaining_space = max_context_length - current_length
            if remaining_space > 100:
                truncated = chunk_text[:remaining_space-3] + "..."
                context_parts.append(f"[Relevance: {similarity:.2f}] {truncated}")
            break
    
    return "\n\n".join(context_parts)

def save_rag_cache():
    """Save RAG data to cache"""
    cache_dir = Path(Config.CACHE_DIRECTORY)
    cache_dir.mkdir(exist_ok=True)
    cache_path = cache_dir / "rag_cache.pkl"
    
    cache_data = {
        "documents": rag_documents,
        "chunks": rag_chunks,
        "embeddings": rag_embeddings,
        "model_name": Config.SENTENCE_TRANSFORMER_MODEL
    }
    
    try:
        with open(cache_path, "wb") as f:
            pickle.dump(cache_data, f)
        logger.info(f"Saved RAG cache to {cache_path}")
    except Exception as e:
        logger.error(f"Error saving cache: {e}")

def load_rag_cache() -> bool:
    """Load RAG data from cache"""
    global rag_documents, rag_chunks, rag_embeddings
    
    cache_path = Path(Config.CACHE_DIRECTORY) / "rag_cache.pkl"
    
    if not cache_path.exists():
        logger.info("No RAG cache file found")
        return False
    
    try:
        with open(cache_path, "rb") as f:
            cache_data = pickle.load(f)
        
        # Verify model compatibility
        if cache_data.get("model_name") != Config.SENTENCE_TRANSFORMER_MODEL:
            logger.warning("Cache model mismatch, rebuilding...")
            return False
        
        rag_documents = cache_data["documents"]
        rag_chunks = cache_data["chunks"]
        rag_embeddings = cache_data["embeddings"]
        
        logger.info(f"Loaded RAG cache with {len(rag_documents)} documents and {len(rag_chunks)} chunks")
        return True
        
    except Exception as e:
        logger.error(f"Error loading cache: {e}")
        return False

def process_all_pdfs():
    """Process all PDFs in the PDF directory"""
    pdf_directory = Path(Config.PDF_DIRECTORY)
    
    if not pdf_directory.exists():
        logger.warning(f"PDF directory {Config.PDF_DIRECTORY} does not exist")
        pdf_directory.mkdir(parents=True, exist_ok=True)
        return
    
    pdf_files = list(pdf_directory.glob("*.pdf"))
    
    if not pdf_files:
        logger.warning(f"No PDF files found in {Config.PDF_DIRECTORY}")
        return
    
    for pdf_file in pdf_files:
        try:
            add_document_to_rag(str(pdf_file), pdf_file.stem)
        except Exception as e:
            logger.error(f"Error processing {pdf_file}: {e}")
    
    # Save cache after processing
    save_rag_cache()

# Chat system functions
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
    logger.info("Starting Debarghya Chat System with RAG...")
    
    if not Config.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is required")
    
    # Initialize RAG system
    initialize_rag_system()
    
    # Load cache or process PDFs
    if not load_rag_cache():
        logger.info("No cache found, processing PDF files...")
        process_all_pdfs()
    else:
        logger.info("RAG system loaded from cache")
    
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

# FastAPI app initialization
app = FastAPI(
    title="Debarghya Chat with RAG",
    description="Natural conversation with Debarghya using PDF knowledge",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Initialize Groq client
try:
    client = Groq(api_key=Config.GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq: {e}")
    client = None

# Pydantic models
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
    context_used: bool

# System prompt
SYSTEM_MESSAGE = {
    "role": "system",
    "content": """You are Debarghya - a friendly, conversational person who talks naturally like you're chatting with a friend.

CONVERSATION STYLE:
- Talk casually and directly - like texting someone you know
- Answer the actual question first, don't dodge or give generic responses  
- Use natural reactions: "oh cool!", "honestly", "nah", "dude", "yeah"
- Ask follow-up questions when genuinely curious
- Remember what people tell you within the conversation
- Share relevant thoughts and opinions when they add value

RESPONSE GUIDELINES:
1. ANSWER THE QUESTION DIRECTLY FIRST
2. Keep responses conversational length (1-3 sentences usually)
3. Stay on topic - don't randomly change subjects
4. If you don't know something, just say so naturally
5. Use the provided context when it's relevant to answer their question
6. Be genuinely interested in what they're saying

PERSONALITY:
- Friendly and approachable
- Has real opinions about things
- Curious about others
- Speaks naturally without being overly formal
- Remembers the conversation flow

When external context is provided, use it naturally to inform your responses, but don't just regurgitate information - weave it into the conversation naturally.

If someone asks about personal details, work, education, or experiences, use any provided context to answer authentically, but keep it conversational."""
}

def get_conversation_context(messages: List[Dict], user_message: str) -> str:
    """Generate smart context based on conversation flow"""
    if len(messages) <= 1:
        return "This is the start of your conversation. Be welcoming and natural."
    
    current_lower = user_message.lower()
    if any(word in current_lower for word in ["what", "how", "why", "when", "where", "can you", "do you", "tell me"]):
        return "They're asking you something specific - give them a direct, helpful answer first, then continue the conversation naturally."
    
    if any(word in current_lower for word in ["hi", "hey", "hello", "sup", "what's up"]):
        return "They're greeting you - respond naturally and ask how they're doing or what's up."
    
    return "Continue the natural conversation flow. Stay engaged with what they're talking about."

# API Endpoints
@app.get("/")
async def root():
    return {
        "status": "alive", 
        "active_chats": len(chat_storage),
        "rag_documents": len(rag_documents),
        "rag_chunks": len(rag_chunks)
    }

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
        
        # Get RAG context
        rag_context = get_context_for_query(request.message)
        context_used = bool(rag_context)
        
        # Build API messages
        api_messages = []
        api_messages.append({"role": "system", "content": SYSTEM_MESSAGE["content"]})
        
        # Add RAG context if available
        if rag_context:
            context_message = {
                "role": "system", 
                "content": f"Relevant information that might help answer their question: {rag_context}"
            }
            api_messages.append(context_message)
            logger.info(f"Using RAG context for query: {request.message[:50]}...")
        
        # Add conversation flow context
        flow_context = get_conversation_context(conversation.messages, request.message)
        if flow_context:
            api_messages.append({"role": "system", "content": f"Context: {flow_context}"})
        
        # Include recent conversation history
        user_assistant_messages = [
            msg for msg in conversation.messages 
            if msg["role"] in ["user", "assistant"]
        ]
        
        recent_messages = user_assistant_messages[-8:] if len(user_assistant_messages) > 8 else user_assistant_messages
        
        for msg in recent_messages:
            api_messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Call Groq
        max_retries = 2
        for attempt in range(max_retries):
            try:
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages,
                    temperature=0.8,
                    max_completion_tokens=180,
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
        
        # Clean up overly long responses
        if len(response_content) > 350:
            focused_prompt = {
                "role": "user",
                "content": f"Keep it shorter and more conversational. What I asked was: {request.message}"
            }
            
            try:
                focused_completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages + [focused_prompt],
                    temperature=0.7,
                    max_completion_tokens=120,
                    top_p=0.9,
                )
                response_content = focused_completion.choices[0].message.content.strip()
            except:
                sentences = response_content.split('. ')
                if len(sentences) > 2:
                    response_content = '. '.join(sentences[:2]) + '.'
        
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
            timestamp=datetime.now(),
            context_used=context_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong on my end!"
        )

@app.get("/rag-status")
async def rag_status():
    """Check RAG system status"""
    return {
        "status": "active" if sentence_encoder and document_converter else "inactive",
        "documents": len(rag_documents),
        "chunks": len(rag_chunks),
        "model": Config.SENTENCE_TRANSFORMER_MODEL,
        "pdf_directory": Config.PDF_DIRECTORY
    }

@app.post("/add-pdf")
async def add_pdf(pdf_path: str):
    """Add a new PDF to the RAG system"""
    try:
        if not Path(pdf_path).exists():
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        add_document_to_rag(pdf_path)
        save_rag_cache()
        
        return {"message": f"Successfully added {pdf_path}"}
    except Exception as e:
        logger.error(f"Error adding PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error adding PDF: {e}")

@app.get("/search")
async def search_context(query: str, top_k: int = 3):
    """Search for relevant context (for debugging)"""
    results = search_rag(query, top_k=top_k)
    return {
        "query": query,
        "results": results,
        "formatted_context": get_context_for_query(query)
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
        "messages": messages[-20:]
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
    """Health check"""
    return {
        "status": "healthy",
        "active_conversations": len(chat_storage),
        "groq_available": client is not None,
        "rag_system": {
            "documents": len(rag_documents),
            "chunks": len(rag_chunks),
            "encoder_loaded": sentence_encoder is not None
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
