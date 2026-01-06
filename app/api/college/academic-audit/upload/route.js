import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  "image/jpeg": { ext: "jpg", category: "image" },
  "image/jpg": { ext: "jpg", category: "image" },
  "image/png": { ext: "png", category: "image" },
  "image/gif": { ext: "gif", category: "image" },
  "image/webp": { ext: "webp", category: "image" },
  "image/svg+xml": { ext: "svg", category: "raw" },
  "application/pdf": { ext: "pdf", category: "raw" },
  "application/msword": { ext: "doc", category: "raw" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: "docx",
    category: "raw",
  },
  "application/vnd.ms-excel": { ext: "xls", category: "raw" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    ext: "xlsx",
    category: "raw",
  },
  "text/plain": { ext: "txt", category: "raw" },
  "text/csv": { ext: "csv", category: "raw" },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
  try {
    // Authentication check
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const section = formData.get("section");

    // Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const fileType = ALLOWED_FILE_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message:
            "Please upload a valid image or document file (JPG, PNG, PDF, DOCX, XLSX, etc.)",
          receivedType: file.type,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: "File size should not exceed 10MB",
          receivedSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        },
        { status: 400 },
      );
    }

    // Validate section
    const validSections = [
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
      "documents",
    ];

    const sectionName = section || "documents";
    if (section && !validSections.includes(section)) {
      return NextResponse.json(
        {
          error: "Invalid section",
          message: `Section must be one of: ${validSections.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Sanitize filename
    const originalFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const sanitizedFilename = `${timestamp}_${originalFilename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type
    const resourceType = fileType.category === "image" ? "image" : "raw";

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `academic-audit/${decoded.id}/${sectionName}`,
          resource_type: resourceType,
          public_id: sanitizedFilename.split(".")[0],
          overwrite: false,
          unique_filename: true,
          use_filename: true,
          ...(resourceType === "image" && {
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          }),
          tags: [
            "academic-audit",
            sectionName,
            decoded.id,
            new Date().getFullYear().toString(),
          ],
          context: {
            alt: `${sectionName} document`,
            caption: `Uploaded by ${decoded.email || "college"}`,
            uploadedAt: new Date().toISOString(),
          },
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        size: result.bytes,
        width: result.width || null,
        height: result.height || null,
        createdAt: result.created_at,
        originalFilename: file.name,
        section: sectionName,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error.http_code) {
      return NextResponse.json(
        {
          error: "Cloudinary upload failed",
          message: error.message,
          details: error.error?.message || "Unknown Cloudinary error",
        },
        { status: error.http_code },
      );
    }

    return NextResponse.json(
      {
        error: "File upload failed",
        message: "An unexpected error occurred during file upload",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const folder = section
      ? `academic-audit/${decoded.id}/${section}`
      : `academic-audit/${decoded.id}`;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 100,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      files: result.resources.map((file) => ({
        url: file.secure_url,
        publicId: file.public_id,
        format: file.format,
        size: file.bytes,
        createdAt: file.created_at,
      })),
      totalCount: result.resources.length,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
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

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 },
      );
    }

    if (!publicId.startsWith(`academic-audit/${decoded.id}`)) {
      return NextResponse.json(
        { error: "Unauthorized to delete this file" },
        { status: 403 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    if (result.result === "ok") {
      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      return NextResponse.json(
        { error: "File not found or already deleted" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file", details: error.message },
      { status: 500 },
    );
  }
}
