const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["A", "B", "C", "D", "E", "F"],
    required: function () {
      return ["single", "multiple"].includes(this.parent().type);
    },
  },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema(
  {
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionBank",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["single", "multiple", "true_false", "fill_blank", "essay"],
      default: "single",
    },
    options: [optionSchema], // dùng cho single/multiple/true_false
    correctAnswers: [
      {
        type: String, // dùng cho fill_blank (ví dụ ["Paris", "London"])
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: [String],
    explanation: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema, "questions");
