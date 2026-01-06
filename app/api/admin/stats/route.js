import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/config/database';
import College from '@/models/College';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
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

    const totalColleges = await College.countDocuments();
    const approvedColleges = await College.countDocuments({ status: 'approved' });
    const pendingRequests = await College.countDocuments({ status: 'pending' });
    const rejectedRequests = await College.countDocuments({ status: 'rejected' });

    return NextResponse.json({
      totalColleges,
      approvedColleges,
      pendingRequests,
      rejectedRequests,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching stats' },
      { status: 500 }
    );
  }
}
