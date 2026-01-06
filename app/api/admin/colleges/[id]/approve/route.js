import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/config/database';
import College from '@/models/College';
import { verifyToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    
    // Check if college exists and is pending
    const college = await College.findById(id);

    if (!college) {
      return NextResponse.json({ message: 'College not found' }, { status: 404 });
    }

    if (college.status !== 'pending') {
      return NextResponse.json({ message: 'College has already been processed' }, { status: 400 });
    }

    // Use findByIdAndUpdate to bypass validation on unchanged fields
    const updatedCollege = await College.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        updatedAt: Date.now(),
      },
      { 
        new: true,
        runValidators: false // Don't run validators on update
      }
    );

    // Send approval email with correct parameters
    try {
      await sendEmail({
        to: updatedCollege.email,
        subject: 'Registration Approved - IPU Trinity',
        html: emailTemplates.collegeApproved(
          updatedCollege.collegeName,
          updatedCollege.email,
          updatedCollege.collegeCode
        ),
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({ 
      message: 'College approved successfully',
      college: {
        _id: updatedCollege._id,
        collegeName: updatedCollege.collegeName,
        status: updatedCollege.status
      }
    });
  } catch (error) {
    console.error('Approve college error:', error);
    return NextResponse.json(
      { message: 'An error occurred while approving college' },
      { status: 500 }
    );
  }
}
