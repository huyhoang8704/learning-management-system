const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");

exports.startQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId)
      .populate("questionBanks.bank", "name");

    if (!quiz) 
      return res.status(404).json({ message: "Quiz not found" });

    if (!quiz.isPublished)
      return res.status(400).json({ message: "Quiz is not published" });

    //Check nếu user đã có attempt chưa hoàn thành
    const existingAttempt = await QuizAttempt.findOne({
      quiz: quizId,
      user: userId,
      submittedAt: null
    });

    if (existingAttempt) {
      return res.status(400).json({
        message: "You already have an active quiz attempt",
        attemptId: existingAttempt._id,
      });
    }

    let randomizedQuestions = [];

    for (const qb of quiz.questionBanks) {
      
      const availableCount = await Question.countDocuments({
        bank: qb.bank._id,
        isActive: true,
      });

      if (availableCount < qb.numberOfQuestions) {
        return res.status(400).json({
          message: `Bank "${qb.bank.name}" không đủ câu hỏi (${availableCount}/${qb.numberOfQuestions})`
        });
      }

      const qs = await Question.aggregate([
        { $match: { bank: qb.bank._id, isActive: true } },
        { $sample: { size: qb.numberOfQuestions } },
      ]);

      randomizedQuestions.push(...qs);
    }

    if (quiz.randomOrder) {
      randomizedQuestions = randomizedQuestions.sort(() => Math.random() - 0.5);
    }

    // ❗ Snapshot không bao gồm đáp án
    const snapshot = randomizedQuestions.map((q) => ({
      questionId: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
    }));

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      questions: snapshot,
      startedAt: new Date(),
    });

    res.status(201).json({
      message: "Quiz started successfully",
      totalQuestions: snapshot.length,
      attemptId: attempt._id,
      questions: snapshot, // Không có đúng sai
    });

  } catch (error) {
    console.error("Error starting quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


exports.submitQuiz = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const userId = req.user._id;
    const { answers } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.user.toString() !== userId.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (attempt.status === "submitted")
      return res.status(400).json({ message: "Quiz already submitted" });

    // Lưu đáp án
    attempt.answers = answers;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";

    // Tính điểm
    let score = 0;
    const total = attempt.questions.length;

    for (const q of attempt.questions) {
      const userAnswer = answers.find((a) => a.questionId.toString() === q.questionId.toString());
      if (!userAnswer) continue;

      let correct = false;

      switch (q.type) {
        case "single":
        case "true_false":
          correct = JSON.stringify(userAnswer.answer) === JSON.stringify(q.correctAnswers);
          break;
        case "multiple":
        case "fill_blank":
          correct = JSON.stringify(userAnswer.answer.sort()) === JSON.stringify(q.correctAnswers.sort());
          break;
        case "essay":
          correct = false; // essay chấm tay
          break;
      }

      if (correct) score++;
    }

    const percentage = Math.round((score / total) * 100);
    attempt.score = percentage;

    await attempt.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score: percentage,
      totalQuestions: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId)
      .populate("quiz", "title")
      .populate("user", "name email");

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    res.status(200).json({ attempt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
exports.getAllAttemptsForQuiz = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.quizId })
      .populate("user", "name email")
      .sort({ startedAt: -1 });

    res.status(200).json({ total: attempts.length, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate("quiz", "title")
      .sort({ startedAt: -1 });

    res.status(200).json({ total: attempts.length, attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
