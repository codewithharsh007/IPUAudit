import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { verificationToken, otp } = await request.json();

    if (!verificationToken || !otp) {
      return NextResponse.json(
        { message: 'Verification token and OTP are required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(verificationToken);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if it's the correct token type
    if (decoded.type !== 'email_verification') {
      return NextResponse.json(
        { message: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (decoded.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        email: decoded.email 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'An error occurred while verifying OTP' },
      { status: 500 }
    );
  }
}
