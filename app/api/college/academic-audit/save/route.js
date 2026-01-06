import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/config/database";
import AcademicAudit from "@/models/AcademicAudit";
import College from "@/models/College";

// Valid section keys matching your schema
const VALID_SECTIONS = [
  "academicPrograms",
  "accreditation",
  "teachersAvailability",
  "qualityOfTeachers",
  "facultyDevelopment",
  "grievanceRedressal",
  "universityExaminations",
  "library",
  "laboratories",
  "coCurricularActivities",
  "publications",
  "studentDevelopment",
  "placement",
  "generalParameters",
  "feedback",
  "deficiencies",
];

// ==================== POST - Save/Update Audit ====================
export async function POST(request) {
  try {
    // 1. Authentication & Authorization
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Parse and Validate Request Body
    const body = await request.json();
    const {
      section,
      data,
      currentStep,
      academicYear = new Date().getFullYear().toString(),
      auditId,
    } = body;

    // Validate section name
    if (section && !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section: ${section}` },
        { status: 400 },
      );
    }

    // Validate academic year format
    if (academicYear && !/^\d{4}-\d{2}$/.test(academicYear)) {
      return NextResponse.json(
        {
          error:
            "Invalid academic year format. Use YYYY-YY format (e.g., 2024-25)",
        },
        { status: 400 },
      );
    }

    // Validate currentStep
    if (currentStep && (currentStep < 1 || currentStep > 17)) {
      return NextResponse.json(
        { error: "Invalid step number. Must be between 1 and 17" },
        { status: 400 },
      );
    }

    // 4. Find or Create Audit
    let audit;

    if (auditId) {
      // Find by specific ID
      audit = await AcademicAudit.findOne({
        _id: auditId,
        collegeId: decoded.id,
      });

      if (!audit) {
        return NextResponse.json(
          { error: "Audit not found or access denied" },
          { status: 404 },
        );
      }

      // Check if audit is editable
      if (audit.status === "approved") {
        return NextResponse.json(
          { error: "Cannot edit approved audit" },
          { status: 403 },
        );
      }
    } else {
      // Find existing draft for this year
      audit = await AcademicAudit.findOne({
        collegeId: decoded.id,
        academicYear: academicYear,
        status: { $in: ["draft", "rejected"] },
      });
    }

    // 5. Create New Audit if Needed
    if (!audit) {
      const college = await College.findById(decoded.id).lean();

      if (!college) {
        return NextResponse.json(
          { error: "College profile not found" },
          { status: 404 },
        );
      }

      audit = new AcademicAudit({
        collegeId: decoded.id,
        academicYear: academicYear,
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
    }

    // 6. Update Section Data
    if (section && data) {
      if (typeof data !== "object") {
        return NextResponse.json(
          { error: "Invalid data format" },
          { status: 400 },
        );
      }

      audit[section] = data;

      if (currentStep && currentStep > audit.currentStep) {
        audit.currentStep = currentStep;
      }
    } else if (currentStep) {
      audit.currentStep = currentStep;
    }

    // 7. Save Audit
    await audit.save();

    // 8. Return Success Response
    return NextResponse.json({
      success: true,
      message: "Audit saved successfully",
      audit: {
        _id: audit._id,
        id: audit._id,
        status: audit.status,
        currentStep: audit.currentStep,
        academicYear: audit.academicYear,
        lastUpdated: audit.updatedAt,
        ...(section && { [section]: audit[section] }),
      },
    });
  } catch (error) {
    console.error("Save error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.values(error.errors).map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An audit for this year already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to save data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ==================== GET - Fetch Audit ====================
export async function GET(request) {
  try {
    // 1. Authentication & Authorization
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");
    const academicYear =
      searchParams.get("year") || new Date().getFullYear().toString();
    const includeAll = searchParams.get("includeAll") === "true";

    // 4. Build Query
    let query = { collegeId: decoded.id };

    if (auditId) {
      query._id = auditId;
    } else {
      query.academicYear = academicYear;

      if (!includeAll) {
        query.status = { $in: ["draft", "rejected"] };
      }
    }

    // 5. Execute Query
    const audit = await AcademicAudit.findOne(query)
      .select("-__v")
      .lean()
      .sort({ updatedAt: -1 });

    // 6. Handle Not Found
    if (!audit) {
      return NextResponse.json(
        {
          success: true,
          audit: null,
          message: "No audit found for the specified criteria",
        },
        { status: 404 },
      );
    }

    // 7. Return Success Response
    return NextResponse.json({
      success: true,
      audit: audit,
    });
  } catch (error) {
    console.error("Fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch data",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ==================== PATCH - Update Specific Fields ====================
export async function PATCH(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { auditId, updates } = body;

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID required" }, { status: 400 });
    }

    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.status === "approved") {
      return NextResponse.json(
        { error: "Cannot edit approved audit" },
        { status: 403 },
      );
    }

    Object.assign(audit, updates);
    await audit.save();

    return NextResponse.json({
      success: true,
      audit: {
        id: audit._id,
        status: audit.status,
        currentStep: audit.currentStep,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update audit" },
      { status: 500 },
    );
  }
}

// ==================== DELETE - Delete Draft ====================
export async function DELETE(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "college") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID required" }, { status: 400 });
    }

    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.status !== "draft") {
      return NextResponse.json(
        { error: "Can only delete draft audits" },
        { status: 403 },
      );
    }

    await audit.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Audit deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 },
    );
  }
}
