import { NextResponse } from 'next/server';

export async function GET() {
  // Try to fetch from Groq with minimal content to test connectivity
  let groqTestResult = 'Not tested';
  const apiKey = process.env.GROQ_API_KEY;
  
  if (apiKey) {
    try {
      const testResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        }),
      });
      
      if (testResponse.ok) {
        groqTestResult = 'Success';
      } else {
        const errorText = await testResponse.text();
        groqTestResult = `Failed: ${testResponse.status} - ${errorText}`;
      }
    } catch (error) {
      groqTestResult = `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API route is working',
    timestamp: new Date().toISOString(),
    envVars: {
      GROQ_API_KEY_EXISTS: !!apiKey,
      // Show first and last 3 characters of the API key if it exists
      GROQ_API_KEY_PREVIEW: apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'Missing',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    },
    groqTest: groqTestResult
  });
} 