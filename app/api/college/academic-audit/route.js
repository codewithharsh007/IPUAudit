import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/config/database";
import AcademicAudit from "@/models/AcademicAudit";
import College from "@/models/College";
import mongoose from "mongoose";

// Helper function for error responses
function errorResponse(message, status = 500, details = null) {
  const response = { error: message };
  if (details && process.env.NODE_ENV === "development") {
    response.details = details;
  }
  return NextResponse.json(response, { status });
}

// Helper function for success responses
function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

// GET - List all audits for the college
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return errorResponse("Unauthorized access", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const year = searchParams.get("year");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // Build query
    let query = { collegeId: decoded.id };

    if (
      status &&
      ["draft", "submitted", "approved", "rejected"].includes(status)
    ) {
      query.status = status;
    }

    if (year) {
      query.academicYear = year;
    }

    // Execute query with optimization
    const [audits, total] = await Promise.all([
      AcademicAudit.find(query)
        .sort({ updatedAt: -1 })
        .select(
          "academicYear status currentStep submittedAt createdAt updatedAt",
        )
        .limit(limit)
        .skip(skip)
        .lean(),
      AcademicAudit.countDocuments(query),
    ]);

    return successResponse({
      audits: audits.map((audit) => ({
        id: audit._id.toString(),
        academicYear: audit.academicYear,
        status: audit.status,
        currentStep: audit.currentStep,
        submittedAt: audit.submittedAt,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audits:", error);
    return errorResponse("Failed to fetch audits", 500, error.message);
  }
}

// POST - Create new audit
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return errorResponse("Unauthorized access", 403);
    }

    await connectDB();

    const body = await request.json();
    const { academicYear } = body;

    // Validate academic year format
    if (academicYear && !/^\d{4}-\d{2}$/.test(academicYear)) {
      return errorResponse(
        "Invalid academic year format. Expected format: 2024-25",
        400,
      );
    }

    const year = academicYear || new Date().getFullYear().toString();

    // Check if audit already exists for this year
    const existingAudit = await AcademicAudit.findOne({
      collegeId: decoded.id,
      academicYear: year,
      status: { $in: ["draft", "submitted"] },
    }).lean();

    if (existingAudit) {
      return NextResponse.json(
        {
          error: "An audit for this year already exists",
          auditId: existingAudit._id.toString(),
          status: existingAudit.status,
        },
        { status: 409 },
      );
    }

    // Validate college exists
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return errorResponse("Invalid college ID", 400);
    }

    // Get college info
    const college = await College.findById(decoded.id)
      .select(
        "collegeName name directorName address directorMobile phone email website",
      )
      .lean();

    if (!college) {
      return errorResponse("College not found", 404);
    }

    // Create new audit
    const audit = new AcademicAudit({
      collegeId: decoded.id,
      academicYear: year,
      status: "draft",
      currentStep: 1,
      instituteInfo: {
        institutionName: college.collegeName || college.name || "",
        directorName: college.directorName || "",
        address: college.address || "",
        directorMobile: college.directorMobile || "",
        instituteTelephone: college.phone || "",
        email: college.email || "",
        website: college.website || "",
      },
    });

    try {
      await audit.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return errorResponse(
          "An audit for this academic year already exists",
          409,
        );
      }
      throw saveError;
    }

    return successResponse(
      {
        audit: {
          id: audit._id.toString(),
          academicYear: audit.academicYear,
          status: audit.status,
          currentStep: audit.currentStep,
          instituteInfo: audit.instituteInfo,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Error creating audit:", error);
    return errorResponse("Failed to create audit", 500, error.message);
  }
}

// DELETE - Delete draft audit
export async function DELETE(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return errorResponse("Unauthorized access", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");

    if (!auditId) {
      return errorResponse("Audit ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(auditId)) {
      return errorResponse("Invalid audit ID format", 400);
    }

    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    });

    if (!audit) {
      return errorResponse("Audit not found", 404);
    }

    if (!["draft", "rejected"].includes(audit.status)) {
      return errorResponse(
        `Cannot delete audit with status '${audit.status}'. Only draft and rejected audits can be deleted.`,
        403,
      );
    }

    await audit.deleteOne();

    return successResponse({
      message: "Audit deleted successfully",
      deletedId: auditId,
    });
  } catch (error) {
    console.error("Error deleting audit:", error);
    return errorResponse("Failed to delete audit", 500, error.message);
  }
}

// PATCH - Update audit status
export async function PATCH(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    const decoded = verifyToken(token);

    if (!decoded || !["college", "admin"].includes(decoded.role)) {
      return errorResponse("Unauthorized access", 403);
    }

    await connectDB();

    const body = await request.json();
    const { auditId, status, reviewComments } = body;

    if (!auditId) {
      return errorResponse("Audit ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(auditId)) {
      return errorResponse("Invalid audit ID format", 400);
    }

    const query = { _id: auditId };

    // College can only update their own audits
    if (decoded.role === "college") {
      query.collegeId = decoded.id;
    }

    const audit = await AcademicAudit.findOne(query);

    if (!audit) {
      return errorResponse("Audit not found", 404);
    }

    // Update status if provided
    if (status) {
      audit.status = status;
    }

    // Admin can add review comments
    if (decoded.role === "admin" && reviewComments) {
      audit.reviewComments = reviewComments;
      audit.reviewedAt = new Date();
      audit.reviewedBy = decoded.id;
    }

    await audit.save();

    return successResponse({
      message: "Audit updated successfully",
      audit: {
        id: audit._id.toString(),
        status: audit.status,
        reviewComments: audit.reviewComments,
        reviewedAt: audit.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Error updating audit:", error);
    return errorResponse("Failed to update audit", 500, error.message);
  }
}
