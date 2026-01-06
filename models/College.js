import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  collegeCode: {
    type: String,
    required: true,
    unique: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  establishmentYear: {
    type: Number,
    required: true,
  },
  directorName: {
    type: String,
    required: true,
  },
  directorMobile: {
    type: String,
    required: true,
  },
  instituteTelephone: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  programs: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
  },
  createdBy: {
    type: String,
    enum: ["self", "admin"],
    default: "self",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// FIXED: Use async function without next parameter
collegeSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

export default mongoose.models.College ||
  mongoose.model("College", collegeSchema);
