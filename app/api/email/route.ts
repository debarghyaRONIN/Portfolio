import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    const { senderEmail, subject, message } = body;
    
    // Basic validation
    if (!senderEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // In a production environment, you'd typically use a service like Nodemailer, SendGrid, etc.
    // For now we'll simulate a successful response
    
    // Log the submission for debugging (would be actual sending logic in production)
    console.log('Email submission received:', {
      to: 'debarghyasren@gmail.com',
      from: senderEmail,
      subject,
      message
    });

    /**
     * TO IMPLEMENT EMAIL SENDING:
     * 1. Install a package like nodemailer: npm install nodemailer
     * 2. Set up SMTP configuration in your .env file
     * 3. Implement the code below
     */
    /*
    // Example with nodemailer
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    await transporter.sendMail({
      from: `"Portfolio Contact" <${senderEmail}>`,
      to: "debarghyasren@gmail.com",
      subject: `Portfolio Contact: ${subject}`,
      text: `From: ${senderEmail}\n\n${message}`,
      html: `<p><strong>From:</strong> ${senderEmail}</p><p>${message.replace(/\n/g, '<br>')}</p>`
    });
    */

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! I\'ll get back to you soon.' 
    });
  } catch (error) {
    console.error('Error processing email submission:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
} 