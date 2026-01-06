import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Validate configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary environment variables are not set!");
}

export default cloudinary;

// Helper function to upload file
export async function uploadToCloudinary(file, options = {}) {
  const {
    folder = "academic-audits",
    resourceType = "auto",
    allowedFormats = ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
  } = options;

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `ipu-trinity/${folder}`,
      resource_type: resourceType,
      allowed_formats: allowedFormats,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "File upload failed");
  }
}

// Helper function to delete file
export async function deleteFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}
