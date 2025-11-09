const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    timeLimit: Number,
    passingScore: Number,
    totalQuestions: Number,

    // Danh sách question id được chọn từ bank
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    // Thông tin tạo quiz ngẫu nhiên (nếu có)
    randomConfig: {
      bank: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" },
      numberOfQuestions: Number,
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "mixed"],
        default: "mixed",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema, "quizzes");
