import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/config/database";
import AcademicAudit from "@/models/AcademicAudit";
import College from "@/models/College";

// Valid section keys matching your schema
const VALID_SECTIONS = [
  "instituteInfo",
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
      console.log("❌ No token found");
      return NextResponse.json(
        { error: "Unauthorized access - Please login again" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return NextResponse.json(
        { error: "Invalid token - Please login again" },
        { status: 401 },
      );
    }

    if (!decoded || decoded.role !== "college") {
      console.log("❌ Invalid role:", decoded?.role);
      return NextResponse.json(
        { error: "Unauthorized access - College access only" },
        { status: 403 },
      );
    }

    console.log("✅ User authenticated:", decoded.email);

    // 2. Connect to Database
    await connectDB();

    // 3. Parse and Validate Request Body
    const body = await request.json();
    const {
      section,
      data,
      currentStep,
      academicYear = "2024-25",
      auditId,
      completedSections, // ✅ ADD THIS LINE
    } = body;

    console.log("📥 Request data:", {
      section,
      currentStep,
      academicYear,
      auditId,
      completedSections, // ✅ ADD THIS LINE
    });

    // Validate section name
    if (section && !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        {
          error: `Invalid section: ${section}. Valid sections: ${VALID_SECTIONS.join(", ")}`,
        },
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
    if (currentStep && (currentStep < 1 || currentStep > 18)) {
      return NextResponse.json(
        { error: "Invalid step number. Must be between 1 and 18" },
        { status: 400 },
      );
    }

    // ✅ ADD THIS: Validate completedSections
    if (completedSections && !Array.isArray(completedSections)) {
      return NextResponse.json(
        { error: "completedSections must be an array" },
        { status: 400 },
      );
    }

    // 4. Find or Create Audit
    let audit;
    let isNewAudit = false;

    if (auditId) {
      console.log("🔍 Finding audit by ID:", auditId);

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
          {
            error:
              "Cannot edit approved audit. Please create a new audit for a different year.",
          },
          { status: 403 },
        );
      }

      if (audit.status === "submitted") {
        return NextResponse.json(
          {
            error: "Cannot edit submitted audit. Please wait for admin review.",
          },
          { status: 403 },
        );
      }

      console.log("✅ Found existing audit:", audit._id);
    } else {
      console.log("🔍 Finding audit for year:", academicYear);

      // Find existing draft for this year
      audit = await AcademicAudit.findOne({
        collegeId: decoded.id,
        academicYear: academicYear,
        status: { $in: ["draft", "rejected"] },
      });

      if (audit) {
        console.log("✅ Found existing draft audit:", audit._id);
      }
    }

    // 5. Create New Audit if Needed
    if (!audit) {
      console.log("📝 Creating new audit for:", academicYear);

      const college = await College.findById(decoded.id)
        .select(
          "collegeName name directorName address directorMobile phone email website",
        )
        .lean();

      if (!college) {
        return NextResponse.json(
          {
            error:
              "College profile not found. Please update your profile first.",
          },
          { status: 404 },
        );
      }

      audit = new AcademicAudit({
        collegeId: decoded.id,
        academicYear: academicYear,
        status: "draft",
        currentStep: 1,
        completedSections: [], // ✅ ADD THIS LINE
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

      isNewAudit = true;
      console.log("✅ New audit created");
    }

    // 6. Update Section Data
    if (section && data) {
      if (typeof data !== "object" || data === null) {
        return NextResponse.json(
          { error: "Invalid data format. Data must be an object." },
          { status: 400 },
        );
      }

      console.log(`💾 Updating section: ${section}`);
      audit[section] = data;

      // Update current step if provided and greater
      if (currentStep && currentStep > audit.currentStep) {
        audit.currentStep = currentStep;
        console.log(`📊 Updated current step to: ${currentStep}`);
      }
    } else if (currentStep) {
      // Just updating step without data
      audit.currentStep = currentStep;
      console.log(`📊 Updated current step to: ${currentStep}`);
    }

    // ✅ ADD THIS: Update completedSections
    if (completedSections !== undefined) {
      // Validate that all sections in completedSections are valid
      const invalidSections = completedSections.filter(
        (s) => !VALID_SECTIONS.includes(s),
      );

      if (invalidSections.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid sections in completedSections: ${invalidSections.join(", ")}`,
          },
          { status: 400 },
        );
      }

      audit.completedSections = completedSections;
      console.log(`✅ Updated completedSections:`, completedSections);
    }

    // 7. Save Audit
    try {
      await audit.save();
      console.log("✅ Audit saved successfully:", audit._id);
    } catch (saveError) {
      console.error("❌ Save error:", saveError);

      if (saveError.code === 11000) {
        return NextResponse.json(
          {
            error:
              "An audit for this year already exists. Please use the existing audit or choose a different year.",
          },
          { status: 409 },
        );
      }

      throw saveError;
    }

    // 8. ✅ Return Success Response with ALL data including completedSections
    return NextResponse.json({
      success: true,
      message: isNewAudit
        ? "New audit created successfully"
        : "Audit updated successfully",
      audit: {
        _id: audit._id.toString(),
        id: audit._id.toString(),
        status: audit.status,
        currentStep: audit.currentStep,
        completedSections: audit.completedSections || [], // ✅ ADD THIS LINE
        academicYear: audit.academicYear,
        lastUpdated: audit.updatedAt,
        createdAt: audit.createdAt,
        // Return ALL sections (whether filled or not)
        instituteInfo: audit.instituteInfo || {},
        academicPrograms: audit.academicPrograms || [],
        accreditation: audit.accreditation || {},
        teachersAvailability: audit.teachersAvailability || {},
        qualityOfTeachers: audit.qualityOfTeachers || {},
        facultyDevelopment: audit.facultyDevelopment || {},
        grievanceRedressal: audit.grievanceRedressal || {},
        universityExaminations: audit.universityExaminations || {},
        library: audit.library || {},
        laboratories: audit.laboratories || {},
        coCurricularActivities: audit.coCurricularActivities || {},
        publications: audit.publications || {},
        studentDevelopment: audit.studentDevelopment || {},
        placement: audit.placement || {},
        generalParameters: audit.generalParameters || {},
        feedback: audit.feedback || {},
        deficiencies: audit.deficiencies || {},
      },
    });
  } catch (error) {
    console.error("❌ POST Save error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: Object.values(error.errors).map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Failed to save audit data",
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
      console.log("❌ GET: No token found");
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      console.error("❌ GET: Token verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded || decoded.role !== "college") {
      console.log("❌ GET: Invalid role:", decoded?.role);
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    // 2. Connect to Database
    await connectDB();

    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");
    const academicYear = searchParams.get("year") || "2024-25";
    const includeAll = searchParams.get("includeAll") === "true";

    console.log("🔍 GET audit:", { auditId, academicYear, includeAll });

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
      console.log("ℹ️ No audit found for:", query);
      return NextResponse.json(
        {
          success: true,
          audit: null,
          message: "No audit found. You can start creating a new one.",
        },
        { status: 404 },
      );
    }

    console.log("✅ Audit found:", audit._id);

    // 7. Return Success Response
    return NextResponse.json({
      success: true,
      audit: {
        ...audit,
        _id: audit._id.toString(),
        id: audit._id.toString(),
      },
    });
  } catch (error) {
    console.error("❌ GET Fetch error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch audit data",
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (
        VALID_SECTIONS.includes(key) ||
        key === "currentStep" ||
        key === "status"
      ) {
        audit[key] = updates[key];
      }
    });

    await audit.save();

    console.log("✅ PATCH: Audit updated:", audit._id);

    return NextResponse.json({
      success: true,
      message: "Audit updated successfully",
      audit: {
        id: audit._id.toString(),
        status: audit.status,
        currentStep: audit.currentStep,
      },
    });
  } catch (error) {
    console.error("❌ PATCH Update error:", error);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    if (audit.status !== "draft" && audit.status !== "rejected") {
      return NextResponse.json(
        { error: `Cannot delete audit with status: ${audit.status}` },
        { status: 403 },
      );
    }

    await audit.deleteOne();

    console.log("✅ DELETE: Audit deleted:", auditId);

    return NextResponse.json({
      success: true,
      message: "Audit deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete audit" },
      { status: 500 },
    );
  }
}
