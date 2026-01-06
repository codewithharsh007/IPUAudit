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
    const body = await request.json();
    const { rejectionReason } = body;

    console.log('Rejecting college:', id);
    console.log('Rejection reason:', rejectionReason);

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
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided',
        updatedAt: Date.now(),
      },
      { 
        new: true,
        runValidators: false // Don't run validators on update
      }
    );

    console.log('College status updated to rejected');

    // Send rejection email
    try {
      await sendEmail({
        to: updatedCollege.email,
        subject: 'Registration Status - IPU Trinity',
        html: emailTemplates.collegeRejected(
          updatedCollege.collegeName,
          updatedCollege.rejectionReason
        ),
      });
      console.log('Rejection email sent successfully');
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({ 
      message: 'College rejected successfully',
      college: {
        _id: updatedCollege._id,
        collegeName: updatedCollege.collegeName,
        status: updatedCollege.status,
        rejectionReason: updatedCollege.rejectionReason
      }
    });
  } catch (error) {
    console.error('Reject college error:', error);
    return NextResponse.json(
      { message: 'An error occurred while rejecting college: ' + error.message },
      { status: 500 }
    );
  }
}
