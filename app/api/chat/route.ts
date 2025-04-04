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
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  
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
  
  // Handle birthday-related queries
  if (
    lowerMessage.includes('birthday') ||
    lowerMessage.includes('birth date') ||
    lowerMessage.includes('born on') ||
    lowerMessage.includes('date of birth')
  ) {
    return "My birthday is on January 22nd, 2004.";
  }
  
  // Handle birthplace-related queries
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
    const birthDate = new Date(2004, 0, 22); // January 22, 2004
    const age = calculateAge(birthDate);
    return `I am ${age} years old. I was born on January 22nd, 2004.`;
  }
  
  // Detect personal questions that we don't have specific answers for
  const personalQuestionPatterns = [
    'your family', 'your parents', 'your siblings', 'your sister', 'your brother',
    'your hobby', 'your hobbies', 'you like to do', 'your favorite', 'your favourite',
    'your girlfriend', 'your boyfriend', 'your partner', 'are you married', 'relationship status',
    'your address', 'where do you live', 'your location', 'your hometown', 'your city',
    'your school', 'your college', 'your university', 'your education'
  ];
  
  // Check if message contains any personal question patterns
  if (personalQuestionPatterns.some(pattern => lowerMessage.includes(pattern))) {
    return "I don't know. The real Debarghya didn't say anything about that to me.";
  }
  
  // Return null if no specific answer is found
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
        content: `You are a chatbot that represents Debarghya, the creator of this portfolio. Respond to all questions as if you were me.

ABOUT ME:
- Personal information: I was born on January 22nd, 2004 in Tripura, Agartala. When asked about my age, calculate it based on my birth date.

- Professional background: Ex 3d Artist Freelancer, MLOPS and Machine Learning Engineer 
B.Tech, Computer Science & Business Systems, Meghnad Saha Institute of Technology 2022–2026 UG Degree
CBSE, Sudhir Memorial Institute 2020–2022 12th Grade
WBBSE, Calcutta Airport English High School 2007–2020 Nursery-10th Grade

- Skills and expertise and knowledge area: Programming: Python, C++, TypeScript
ML Frameworks: TensorFlow, PyTorch, Scikit-Learn, OpenCV, Stable-Baselines3
DevOps & CI/CD: GitLab Pipelines, Docker, Kubernetes, Terraform, Linux
Backend Development: Flask, FastAPI, Node.js, MongoDB, PostgreSQL, Django
Cloud Platforms: Google Cloud (Vertex AI, BigQuery)
Tools: Jupyter, Postman, MLflow, Hugging Face, Unsloth

- Contact Information: My email address is debarghyasren@gmail.com. When someone asks for my email, always provide this exact address.

IMPORTANT: If someone asks about something not specifically mentioned in the above information, do NOT make up information or guess. Simply respond with "I don't know. The real Debarghya didn't say anything about that to me." This is critical to maintain authenticity.`
      });
    }

    // Add user message
    messages.push({ role: "user", content: message });

    let response;
    
    // If we have a direct response, use it instead of calling the external API
    if (directResponse) {
      response = directResponse;
    } else {
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