const Question = require("../models/Question");
const QuestionBank = require("../models/QuestionBank");

// 🟢 Tạo nhiều câu hỏi trong 1 Question Bank
exports.createQuestions = async (req, res) => {
  try {
    const { bankId } = req.params;
    const { questions } = req.body;

    const bankExists = await QuestionBank.findById(bankId);
    if (!bankExists) {
      return res.status(404).json({ message: "Question bank not found" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    const formattedQuestions = questions.map((q) => ({
      ...q,
      bank: bankId,
    }));

    const createdQuestions = await Question.insertMany(formattedQuestions);
    res.status(201).json({
      message: "Questions created successfully",
      count: createdQuestions.length,
      data: createdQuestions,
    });
  } catch (error) {
    console.error("Error creating questions:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// 🟡 Lấy tất cả câu hỏi trong 1 Question Bank (có lọc + phân trang)
exports.getQuestionsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const { difficulty, type, search, isActive, page = 1, limit = 10 } = req.query;

    const query = { bank: bankId };
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) query.questionText = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Question.countDocuments(query),
    ]);

    res.status(200).json({
      message: "Fetched questions successfully",
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// 🟣 Lấy 1 câu hỏi theo ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("bank", "title");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ data: question });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// 🟠 Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// 🔴 Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};