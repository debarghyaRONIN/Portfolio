import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API route is working',
    envVars: {
      GROQ_API_KEY_EXISTS: !!process.env.GROQ_API_KEY
    }
  });
} 