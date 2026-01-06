import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/config/database";
import AcademicAudit from "@/models/AcademicAudit";

export async function POST(request) {
  try {
    // 1. Authenticate user
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json(
        { error: "Unauthorized. Only colleges can submit audits" },
        { status: 403 },
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { auditId } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: "Audit ID is required" },
        { status: 400 },
      );
    }

    // 4. Find audit with proper validation
    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found or you do not have permission to access it" },
        { status: 404 },
      );
    }

    // 5. Check current status
    if (audit.status === "submitted") {
      return NextResponse.json(
        {
          error: "Audit has already been submitted",
          submittedAt: audit.submittedAt,
        },
        { status: 400 },
      );
    }

    if (audit.status === "approved") {
      return NextResponse.json(
        {
          error: "Audit has been approved and cannot be modified",
          approvedAt: audit.reviewedAt,
        },
        { status: 400 },
      );
    }

    // 6. Validate completeness
    const hasFormData =
      audit.academicPrograms && audit.academicPrograms.length > 0;
    const hasPDF = audit.directPDFUpload?.uploaded === true;

    if (!hasFormData && !hasPDF) {
      return NextResponse.json(
        {
          error: "Cannot submit incomplete audit",
          message:
            "Please complete the form sections or upload a completed PDF before submitting",
          currentStep: audit.currentStep,
          completionPercentage: audit.completionPercentage || 0,
        },
        { status: 400 },
      );
    }

    // 7. Additional validation
    if (hasFormData && !hasPDF) {
      const criticalSections = [
        "academicPrograms",
        "accreditation",
        "teachersAvailability",
      ];

      const missingSections = criticalSections.filter((section) => {
        const data = audit[section];
        return !data || (Array.isArray(data) && data.length === 0);
      });

      if (missingSections.length > 0) {
        return NextResponse.json(
          {
            error: "Critical sections incomplete",
            message: "Please complete all required sections before submission",
            missingSections: missingSections.map((s) =>
              s.replace(/([A-Z])/g, " $1").trim(),
            ),
          },
          { status: 400 },
        );
      }
    }

    // 8. Update audit status
    audit.status = "submitted";
    audit.submittedAt = new Date();
    audit.submittedBy = decoded.email || decoded.name;
    audit.currentStep = 17;

    // 9. Save
    try {
      await audit.save();
    } catch (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json(
        {
          error: "Failed to update audit status",
          details: saveError.message,
        },
        { status: 500 },
      );
    }

    // 10. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Academic audit submitted successfully",
        audit: {
          id: audit._id.toString(),
          academicYear: audit.academicYear,
          status: audit.status,
          submittedAt: audit.submittedAt,
          submittedBy: audit.submittedBy,
          institutionName: audit.instituteInfo?.institutionName,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Submission error:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid audit ID format" },
        { status: 400 },
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.values(error.errors).map((e) => e.message),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to submit audit",
        message: "An unexpected error occurred. Please try again later.",
        ...(process.env.NODE_ENV === "development" && {
          details: error.message,
        }),
      },
      { status: 500 },
    );
  }
}

// GET method to check submission status
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");

    if (!auditId) {
      return NextResponse.json(
        { error: "Audit ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    }).select("status submittedAt submittedBy currentStep");

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      audit: {
        id: audit._id,
        status: audit.status,
        submittedAt: audit.submittedAt,
        submittedBy: audit.submittedBy,
        canSubmit: audit.status === "draft" || audit.status === "rejected",
      },
    });
  } catch (error) {
    console.error("Error fetching submission status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  }
}
