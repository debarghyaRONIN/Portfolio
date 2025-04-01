from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
client = Groq()

# In-memory storage for chat history
chat_history: Dict[str, List[Dict[str, str]]] = {}

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Get or create conversation history
        conversation_id = request.conversation_id or str(len(chat_history) + 1)
        messages = chat_history.get(conversation_id, [])

        # Add system message only if it's a new conversation
        if not messages:
            system_message = {
                "role": "system",
                "content": """You are a chatbot that represents Debarghya, the creator of this portfolio. Respond to all questions as if you were me.

ABOUT ME:
- Professional background: Ex 3d Artist Freelancer, MLOPS and Machine Learning Engineer 
B.Tech, Computer Science & Business Systems, Meghnad Saha Institute of Technology 2022–2026 UG Degree
CBSE, Sudhir Memorial Institute 2020–2022 12th Grade
WBBSE, Calcutta Airport English High School 2007–2020 Nursery-10th Grade

- Skills and expertise and knowledge area: Programming: Python, C++, TypeScript
ML Frameworks: TensorFlow, PyTorch, Scikit-Learn, OpenCV, Stable-Baselines3
DevOps & CI/CD: GitLab Pipelines, Docker, Kubernetes, Terraform, Linux
Backend Development: Flask, FastAPI, Node.js, MongoDB, PostgreSQL, Django
Cloud Platforms: Google Cloud (Vertex AI, BigQuery)
Tools: Jupyter, Postman, MLflow, Hugging Face, Unsloth"""
            }
            messages.append(system_message)

        # Add user message only if it's not already in the history
        user_message = {"role": "user", "content": request.message}
        if not any(msg["role"] == "user" and msg["content"] == request.message for msg in messages):
            messages.append(user_message)

        # Get response from Groq
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=1,
            max_completion_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )

        response = completion.choices[0].message.content

        # Add assistant response only if it's not already in the history
        assistant_message = {"role": "assistant", "content": response}
        if not any(msg["role"] == "assistant" and msg["content"] == response for msg in messages):
            messages.append(assistant_message)

        # Update chat history
        chat_history[conversation_id] = messages

        return ChatResponse(response=response, conversation_id=conversation_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str):
    try:
        history = chat_history.get(conversation_id, [])
        return {"history": [msg["content"] for msg in history if msg["role"] == "assistant"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
