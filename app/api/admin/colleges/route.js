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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter = status ? { status } : {};
    const colleges = await College.find(filter).sort({ createdAt: -1 }).select('-password');

    return NextResponse.json(colleges);
  } catch (error) {
    console.error('Fetch colleges error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching colleges' },
      { status: 500 }
    );
  }
}
