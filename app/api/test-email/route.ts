import { NextResponse } from 'next/server';

export async function GET() {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  return NextResponse.json({
    success: true,
    config: {
      serviceId,
      templateId,
      publicKeyPresent: !!publicKey,
      // Don't return the full public key for security reasons
      publicKeyFirstThreeChars: publicKey?.substring(0, 3) 
    },
    message: 'EmailJS configuration retrieved successfully'
  });
} 