import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for chat history (note: this will reset on server restart)
const chatHistory: Record<string, Array<{ role: string; content: string }>> = {};

// Function to calculate age based on birth date
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // If birthday hasn't occurred yet this year, subtract one year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Function to handle specific questions without using the external API
function handleSpecificQuestions(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Keep the specific handlers for well-known information
  
  // Handle email-related queries
  if (
    lowerMessage.includes('email') || 
    lowerMessage.includes('contact') || 
    lowerMessage.includes('mail') ||
    lowerMessage.includes('reach you') ||
    lowerMessage.includes('get in touch')
  ) {
    return "My email address is debarghyasren@gmail.com. Feel free to reach out anytime!";
  }
  
  // Handle age and birthday queries
  if (
    lowerMessage.includes('age') ||
    lowerMessage.includes('how old') ||
    lowerMessage.includes('birthday') ||
    lowerMessage.includes('birth date') ||
    lowerMessage.includes('born on') ||
    lowerMessage.includes('date of birth')
  ) {
    const birthDate = new Date(2004, 1, 22);
    const age = calculateAge(birthDate);
    return `I am ${age} years old. I was born on January 22nd, 2004.`;
  }

  // Handle birthplace queries
  if (
    lowerMessage.includes('where were you born') ||
    lowerMessage.includes('birth place') ||
    lowerMessage.includes('birthplace') ||
    lowerMessage.includes('where are you from') ||
    lowerMessage.includes('where you were born') ||
    lowerMessage.includes('born in') ||
    lowerMessage.includes('where do you come from')
  ) {
    return "I was born in Tripura, Agartala.";
  }

  // Handle age-related queries
  if (
    lowerMessage.includes('age') ||
    lowerMessage.includes('how old') ||
    lowerMessage.includes('years old')
  ) {
    const birthDate = new Date(2004, 1, 22); // January 22, 2004
    const age = calculateAge(birthDate);
    return `I am ${age} years old. I was born on January 22nd, 2004.`;
  }

  // Handle professional background queries
  if (
    lowerMessage.includes('work') ||
    lowerMessage.includes('job') ||
    lowerMessage.includes('profession') ||
    lowerMessage.includes('background')
  ) {
    return "I'm an Ex-3D Artist Freelancer who transitioned into MLOps and Machine Learning Engineering. I specialize in developing and deploying machine learning solutions with a focus on efficient operations and scalable systems.";
  }

  // Handle skills and expertise queries
  if (
    lowerMessage.includes('skill') ||
    lowerMessage.includes('expertise') ||
    lowerMessage.includes('programming') ||
    lowerMessage.includes('technology') ||
    lowerMessage.includes('tech stack')
  ) {
    return "My technical skills include: Programming (Python, C++, TypeScript), ML Frameworks (TensorFlow, PyTorch, Scikit-Learn), DevOps (GitLab, Docker, Kubernetes), Backend Development (Flask, FastAPI, Node.js), and Cloud Platforms (Google Cloud). I'm also experienced with tools like Jupyter, MLflow, and Hugging Face.";
  }

  // Return null to let the Groq API handle all other queries
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id } = await request.json();

    // Check if the message can be handled directly without the external API
    const directResponse = handleSpecificQuestions(message);
    
    // Get or create conversation history
    const conversationId = conversation_id || String(Object.keys(chatHistory).length + 1);
    const messages = chatHistory[conversationId] || [];

    // Add system message only if it's a new conversation
    if (!messages.length) {
      messages.push({
        role: "system",
        content: `You are a helpful and knowledgeable AI assistant that can answer both personal questions about Debarghya and general questions about any topic.

For questions about Debarghya:
- Personal information: Born on January 22nd, 2004 in Tripura, Agartala.
- Professional background: Ex 3d Artist Freelancer, MLOPS and Machine Learning Engineer 
- Education: B.Tech in Computer Science & Business Systems at Meghnad Saha Institute of Technology (2022-2026)
- Skills: Python, C++, TypeScript, ML Frameworks, DevOps, Cloud platforms
- Contact: debarghyasren@gmail.com

For general questions:
- Provide helpful, accurate, and informative responses based on your knowledge
- Be concise but thorough
- If you're not sure about something, be honest about it
- Draw from your broad knowledge base to help users with any topic they ask about

Maintain a friendly and professional tone throughout the conversation.`
      });
    }

    // Add user message
    messages.push({ role: "user", content: message });

    let response;
    
    // If we have a direct response for personal questions, use it
    if (directResponse) {
      response = directResponse;
    } else {
      // Call Groq API for general questions or when we don't have a direct response
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          temperature: 0.7, // Slightly reduced for more focused responses
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
      response = completionData.choices[0].message.content;
    }

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