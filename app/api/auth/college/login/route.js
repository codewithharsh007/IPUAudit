import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import College from '@/models/College';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password, collegeCode } = await request.json();

    if (!email || !password || !collegeCode) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Find college by email
    const college = await College.findOne({ email: email.toLowerCase() });

    if (!college) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check college code
    if (college.collegeCode !== collegeCode) {
      return NextResponse.json(
        { message: 'Invalid college code' },
        { status: 401 }
      );
    }

    // Check if college is approved
    if (college.status === 'pending') {
      return NextResponse.json(
        { message: 'Your registration is pending approval' },
        { status: 403 }
      );
    }

    if (college.status === 'rejected') {
      return NextResponse.json(
        { message: 'Your registration has been rejected' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, college.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: college._id,
      email: college.email,
      role: 'college',
      collegeName: college.collegeName,
    });

    // Create response with cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        college: {
          id: college._id,
          email: college.email,
          collegeName: college.collegeName,
          collegeCode: college.collegeCode,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
