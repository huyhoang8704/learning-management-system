const mongoose = require("mongoose");

const lessonContentSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    type: {
      type: String,
      enum: ["Video", "Reading", "File", "Quiz"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String, // có thể chứa HTML hoặc text
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // minutes
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LessonContent", lessonContentSchema, "lesson_contents");
