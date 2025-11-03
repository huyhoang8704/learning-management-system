const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate: Lesson -> LessonContents
lessonSchema.virtual("contents", {
  ref: "LessonContent",
  localField: "_id",
  foreignField: "lesson",
  justOne: false,
});

module.exports = mongoose.model("Lesson", lessonSchema, "lessons");
