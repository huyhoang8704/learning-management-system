const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String, default: "" },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },

    questionBanks: [
      {
        bank: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" },
        numberOfQuestions: { type: Number },
      },
    ],

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

    timeLimit: { type: Number, default: 0 }, // phút, 0 = không giới hạn

    attemptsAllowed: { type: Number, default: 1 },

    randomOrder: { type: Boolean, default: true },

    passingScore: { type: Number, default: 0 }, // theo %

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema, "quizzes");
