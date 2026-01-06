import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import College from '@/models/College';
import { generateOTP, generateToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if college already exists
    const existingCollege = await College.findOne({ email: email.toLowerCase() });

    if (existingCollege) {
      return NextResponse.json(
        { message: 'A college with this email already exists' },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Create JWT token with OTP and email (expires in 10 minutes)
    const verificationToken = generateToken(
      {
        email: email.toLowerCase(),
        otp,
        type: 'email_verification',
      },
      '10m'
    );

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Email Verification - IPU Trinity',
      html: emailTemplates.otp(otp),
    });

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        verificationToken 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending OTP' },
      { status: 500 }
    );
  }
}
