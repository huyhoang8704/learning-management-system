const QuestionBank = require("../models/QuestionBank");

/**
 * @desc    Create a new question bank
 * @route   POST /api/question-banks
 * @access  Admin / Instructor
 */
exports.createQuestionBank = async (req, res) => {
  try {
    const { title, description, subject } = req.body;
    const createdBy = req.user._id;

    const newBank = await QuestionBank.create({
      title,
      description,
      subject,
      createdBy,
    });

    res.status(201).json({ success: true, data: newBank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all question banks (pagination + search)
 * @route   GET /api/question-banks
 * @access  Admin / Instructor
 */
exports.getAllQuestionBanks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const total = await QuestionBank.countDocuments(query);
    const banks = await QuestionBank.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: banks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get question bank by ID
 * @route   GET /api/question-banks/:id
 * @access  Admin / Instructor
 */
exports.getQuestionBankById = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate({
        path: "questions",
        select: "questionText type difficulty options", // chọn trường cần
      });

    if (!bank)
      return res
        .status(404)
        .json({ success: false, message: "Question bank not found" });

    res.json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update question bank
 * @route   PUT /api/question-banks/:id
 * @access  Admin / Instructor (owner)
 */
exports.updateQuestionBank = async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    const bank = await QuestionBank.findById(req.params.id);
    if (!bank)
      return res
        .status(404)
        .json({ success: false, message: "Question bank not found" });

    // Optional: chỉ cho phép người tạo hoặc admin cập nhật
    if (req.user.role !== "admin" && bank.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    bank.title = title || bank.title;
    bank.description = description || bank.description;
    bank.subject = subject || bank.subject;
    await bank.save();

    res.json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete question bank
 * @route   DELETE /api/question-banks/:id
 * @access  Admin / Instructor (owner)
 */
exports.deleteQuestionBank = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank)
      return res
        .status(404)
        .json({ success: false, message: "Question bank not found" });

    if (req.user.role !== "admin" && bank.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await bank.deleteOne();
    res.json({ success: true, message: "Question bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
