import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/config/database";
import College from "@/models/College";

export async function PATCH(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== "college") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      collegeName,
      directorName,
      address,
      directorMobile,
      phone,
      email,
      website,
    } = body;

    // Find and update college
    const college = await College.findById(decoded.id);

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (collegeName) college.collegeName = collegeName;
    if (directorName) college.directorName = directorName;
    if (address) college.address = address;
    if (directorMobile) college.directorMobile = directorMobile;
    if (phone) college.phone = phone;
    if (email) college.email = email;
    if (website) college.website = website;

    await college.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      college: {
        id: college._id,
        collegeName: college.collegeName,
        directorName: college.directorName,
        address: college.address,
        email: college.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
