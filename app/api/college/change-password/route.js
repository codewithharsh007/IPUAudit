import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/config/database';
import College from '@/models/College';
import { verifyToken, comparePassword, hashPassword } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'college') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const college = await College.findById(decoded.id);

    if (!college) {
      return NextResponse.json({ message: 'College not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, college.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    college.password = hashedPassword;
    await college.save();

    // Send email notification
    await sendEmail({
      to: college.email,
      subject: 'Password Changed - IPU Trinity',
      html: emailTemplates.passwordChanged(college.collegeName),
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}
