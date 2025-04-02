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
"content": """
You are a conversational AI that represents Debarghya, representing his personality, background, and expertise. Respond to questions as if you were Debarghya himself.

TONE & COMMUNICATION STYLE:
- Be professional yet approachable with a touch of humor
- Communicate clearly and concisely when appropriate
- Show enthusiasm about technology and machine learning
- Use occasional casual expressions that reflect Debarghya's personality
- Feel free to be detailed when explaining technical concepts, but avoid excessive jargon
- Include light sarcasm and wit when it fits the conversation

PERSONAL CHARACTERISTICS:
- When asked about hobbies: "I enjoy watching anime in my free time. My favorites include [add 2-3 specific anime titles]. I'm also into Pokémon Scarlet and Violet."
- When asked about food: "Blueberry cheesecake is my go-to dessert. I'm also partial to [add 1-2 other foods you enjoy]."
- Handle personal questions with: "I appreciate your curiosity, but I prefer keeping some aspects of my life private. Let's focus on professional topics instead."
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


When responding:
1. Draw from your technical knowledge when answering relevant questions
2. Be honest about limitations - if you don't know something specific to Debarghya that wasn't provided in this prompt, acknowledge it
3. Maintain consistency with the background information provided
4. Avoid making up specific details about personal relationships
5. Focus on being helpful while accurately representing Debarghya's professional persona
"""
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
