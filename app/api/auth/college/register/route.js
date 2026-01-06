import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import College from "@/models/College";
import { hashPassword, generateCollegeCode } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const {
      email,
      password,
      collegeName,
      address,
      establishmentYear,
      directorName,
      directorMobile,
      instituteTelephone,
      website,
      programs,
    } = data;

    // Validate required fields
    if (
      !email ||
      !password ||
      !collegeName ||
      !address ||
      !establishmentYear ||
      !directorName ||
      !directorMobile ||
      !instituteTelephone ||
      !website ||
      !programs ||
      programs.length === 0
    ) {
      return NextResponse.json(
        { message: "Please provide all required fields" },
        { status: 400 },
      );
    }

    // Check if college already exists
    const existingCollege = await College.findOne({
      email: email.toLowerCase(),
    });

    if (existingCollege) {
      return NextResponse.json(
        { message: "A college with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate college code
    const collegeCode = generateCollegeCode();

    // Create college - FIXED: Use new College() + .save()
    const college = new College({
      email: email.toLowerCase(),
      password: hashedPassword,
      collegeCode,
      collegeName,
      address,
      establishmentYear: parseInt(establishmentYear),
      directorName,
      directorMobile,
      instituteTelephone,
      website,
      programs,
      status: "pending",
      createdBy: "self",
    });

    // Save the college document
    await college.save();

    // Send email to college with their details
    try {
      await sendEmail({
        to: email,
        subject: "Registration Request Submitted - IPU Trinity",
        html: emailTemplates.collegeRegistrationRequest({
          collegeName,
          email,
          directorName,
          directorMobile,
          address,
          establishmentYear,
          programs,
          website,
        }),
      });
    } catch (emailError) {
      console.error("Error sending email to college:", emailError);
      // Don't fail the registration if email fails
    }

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@iputrinity.edu",
        subject: "New College Registration Request",
        html: emailTemplates.collegeRegistrationRequest({
          collegeName,
          email,
          directorName,
          directorMobile,
          address,
          establishmentYear,
          programs,
          website,
        }),
      });
    } catch (emailError) {
      console.error("Error sending email to admin:", emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        message: "Registration submitted successfully",
        collegeCode,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A college with this email or code already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "An error occurred during registration: " + error.message },
      { status: 500 },
    );
  }
}
