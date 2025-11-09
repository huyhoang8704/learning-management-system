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
      enum: ["Video", "Article", "File", "Quiz", "Slide"],
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
    difficulty_init: {
      type: Number,
      default: 0.5,
      min : 0,
      max : 1
    },
    interactivity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    difficulty_dyn: {
      type: Number,
      default: 0,
      min : 0,
      max : 1
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LessonContent", lessonContentSchema, "lesson_contents");
