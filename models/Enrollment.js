const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0, // phần trăm hoàn thành (0–100)
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Dropped"],
      default: "Active",
    },
    lastAccessed: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Một sinh viên chỉ có thể ghi danh 1 lần cho 1 khóa học
enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema, "enrollments");
