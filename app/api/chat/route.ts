import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for chat history (note: this will reset on server restart)
const chatHistory: Record<string, Array<{ role: string; content: string }>> = {};

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id } = await request.json();

    // Get or create conversation history
    const conversationId = conversation_id || String(Object.keys(chatHistory).length + 1);
    const messages = chatHistory[conversationId] || [];

    // Add system message only if it's a new conversation
    if (!messages.length) {
      messages.push({
        role: "system",
        content: `You are a chatbot that represents Debarghya, the creator of this portfolio. Respond to all questions as if you were me.

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
Tools: Jupyter, Postman, MLflow, Hugging Face, Unsloth`
      });
    }

    // Add user message
    messages.push({ role: "user", content: message });

    // Call Groq API directly
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
      }),
    });

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorBody);
      throw new Error(`API request failed with status ${groqResponse.status}: ${errorBody}`);
    }

    const completionData = await groqResponse.json();
    const response = completionData.choices[0].message.content;

    // Add assistant response
    messages.push({ role: "assistant", content: response });

    // Update chat history
    chatHistory[conversationId] = messages;

    return NextResponse.json({ 
      response, 
      conversation_id: conversationId 
    });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
        groqApiKey: process.env.GROQ_API_KEY ? 'Present (redacted)' : 'Missing' 
      }, 
      { status: 500 }
    );
  }
} 