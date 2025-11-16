const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },

    score: { type: Number, default: 0 },
    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress" },

    // Snapshot câu hỏi
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },

        questionText: String,
        type: String,
        options: Array,
        correctAnswers: Array,
      },
    ],

    // câu trả lời của sinh viên
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: Array, // multiple/single/fill
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
