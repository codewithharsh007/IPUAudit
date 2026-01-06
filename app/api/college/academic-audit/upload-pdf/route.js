import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/database";
import AcademicAudit from "@/models/AcademicAudit";
import College from "@/models/College";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  let uploadedPublicId = null;

  try {
    // ===== AUTHENTICATION =====
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

    // ===== PARSE FORM DATA =====
    const formData = await request.formData();
    const file = formData.get("file");
    const academicYear =
      formData.get("academicYear") || new Date().getFullYear().toString();
    const submitImmediately = formData.get("submitImmediately") === "true";
    const auditId = formData.get("auditId");

    // ===== VALIDATE FILE =====
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file" },
        { status: 400 },
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `PDF size should not exceed ${maxSize / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    if (!file.name || file.name.length > 255) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}$/.test(academicYear)) {
      return NextResponse.json(
        { error: "Invalid academic year format. Use YYYY-YY (e.g., 2024-25)" },
        { status: 400 },
      );
    }

    // ===== UPLOAD TO CLOUDINARY =====
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPDF = buffer.toString("ascii", 0, 4) === "%PDF";
    if (!isPDF) {
      return NextResponse.json(
        { error: "File content is not a valid PDF" },
        { status: 400 },
      );
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `academic-audit/${decoded.id}/complete-pdf`,
          resource_type: "raw",
          public_id: `audit-${academicYear}-${Date.now()}`,
          format: "pdf",
          type: "authenticated",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    uploadedPublicId = uploadResult.public_id;

    // ===== DATABASE OPERATIONS =====
    await connectDB();

    let audit;

    if (auditId) {
      // Update existing audit by ID
      if (!/^[0-9a-fA-F]{24}$/.test(auditId)) {
        throw new Error("Invalid audit ID format");
      }

      audit = await AcademicAudit.findOne({
        _id: auditId,
        collegeId: decoded.id,
      });

      if (!audit) {
        throw new Error("Audit not found or access denied");
      }

      if (audit.status === "approved" || audit.status === "submitted") {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
        });

        return NextResponse.json(
          {
            error: `Cannot modify audit with status: ${audit.status}. Please create a new audit.`,
          },
          { status: 400 },
        );
      }
    } else {
      // Find or create audit for this year
      audit = await AcademicAudit.findOne({
        collegeId: decoded.id,
        academicYear: academicYear,
      });

      if (audit) {
        // Audit exists - check if it's editable
        if (audit.status !== "draft" && audit.status !== "rejected") {
          await cloudinary.uploader.destroy(uploadedPublicId, {
            resource_type: "raw",
          });

          return NextResponse.json(
            {
              error: `An audit for ${academicYear} already exists with status: ${audit.status}`,
              auditId: audit._id.toString(),
              status: audit.status,
              message:
                audit.status === "submitted"
                  ? "This audit has been submitted and cannot be modified."
                  : "This audit has been approved and cannot be modified.",
            },
            { status: 409 },
          );
        }
        // Audit is draft or rejected - we can update it
      } else {
        // No audit exists - create new one
        const college = await College.findById(decoded.id).select(
          "collegeName name directorName address phone email website directorMobile",
        );

        if (!college) {
          throw new Error("College profile not found");
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
    }

    // Delete old PDF if exists
    if (audit.directPDFUpload?.publicId) {
      try {
        await cloudinary.uploader.destroy(audit.directPDFUpload.publicId, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("Failed to delete old PDF:", cleanupError);
      }
    }

    // Update PDF details
    audit.directPDFUpload = {
      uploaded: true,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
      uploadedAt: new Date(),
    };

    if (submitImmediately) {
      audit.status = "submitted";
      audit.submittedAt = new Date();
      audit.submittedBy = decoded.email;
      audit.currentStep = 17;
    }

    // Save with error handling
    try {
      await audit.save();
    } catch (saveError) {
      console.error("Save error:", saveError);

      // Handle duplicate key error
      if (saveError.code === 11000) {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
        });

        return NextResponse.json(
          {
            error: `An audit for ${academicYear} already exists`,
            message:
              "This might be a race condition. Please refresh the page and try again.",
          },
          { status: 409 },
        );
      }

      // Re-throw other errors
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      message: submitImmediately
        ? "PDF uploaded and submitted successfully"
        : "PDF uploaded successfully",
      audit: {
        id: audit._id.toString(),
        academicYear: audit.academicYear,
        pdfUrl: uploadResult.secure_url,
        status: audit.status,
        fileName: file.name,
        uploadedAt: audit.directPDFUpload.uploadedAt,
      },
    });
  } catch (error) {
    console.error("PDF upload error:", error);

    // Cleanup uploaded file on error
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
        });
        console.log("Cleaned up uploaded file:", uploadedPublicId);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }

    const statusCode = error.message.includes("not found") ? 404 : 500;

    return NextResponse.json(
      {
        success: false,
        error: error.message || "PDF upload failed",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: statusCode },
    );
  }
}

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
    const academicYear =
      searchParams.get("year") || new Date().getFullYear().toString();
    const auditId = searchParams.get("id");

    await connectDB();

    let query = { collegeId: decoded.id };

    if (auditId) {
      query._id = auditId;
    } else {
      query.academicYear = academicYear;
    }

    const audit = await AcademicAudit.findOne(query)
      .select("directPDFUpload status academicYear")
      .lean();

    if (!audit) {
      return NextResponse.json(
        { success: false, message: "No audit found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      hasPDF: audit.directPDFUpload?.uploaded || false,
      pdfDetails: audit.directPDFUpload || null,
      status: audit.status,
    });
  } catch (error) {
    console.error("GET PDF status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDF status" },
      { status: 500 },
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("id");

    if (!auditId) {
      return NextResponse.json({ error: "Audit ID required" }, { status: 400 });
    }

    await connectDB();

    const audit = await AcademicAudit.findOne({
      _id: auditId,
      collegeId: decoded.id,
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot delete PDF from submitted audit" },
        { status: 400 },
      );
    }

    if (audit.directPDFUpload?.publicId) {
      await cloudinary.uploader.destroy(audit.directPDFUpload.publicId, {
        resource_type: "raw",
      });
    }

    audit.directPDFUpload = {
      uploaded: false,
      fileUrl: "",
      publicId: "",
      fileName: "",
      uploadedAt: null,
    };

    await audit.save();

    return NextResponse.json({
      success: true,
      message: "PDF deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PDF error:", error);
    return NextResponse.json(
      { error: "Failed to delete PDF" },
      { status: 500 },
    );
  }
}
