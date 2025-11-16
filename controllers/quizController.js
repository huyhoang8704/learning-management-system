const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuestionBank = require("../models/QuestionBank");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const QuizAttempt = require("../models/QuizAttempt");

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, course, lesson, questionBanks, timeLimit, attemptsAllowed, randomOrder, passingScore } = req.body;
    if (await Course.findById(course) === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }
    if (lesson && await Lesson.findById(lesson) === null) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }
    const quiz = new Quiz({
      title,
      description,
      course,
      lesson,      
      questionBanks,
      timeLimit,
      attemptsAllowed,
      randomOrder,
      passingScore,
    });
    await quiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      data: quiz,
    });

  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all quizzes with optional filters and pagination
exports.getAllQuizzes = async (req, res) => {
  try {
    const { search, course, lesson, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (course) query.course = course;
    if (lesson) query.lesson = lesson;

    const skip = (Number(page) - 1) * Number(limit);

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Quiz.countDocuments(query),
    ]);

    res.status(200).json({
      message: "Fetched quizzes successfully",
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: quizzes,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get a single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title")
      .populate("lesson", "title")
      .populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// POST /api/quizzes/:id/start
exports.startQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;

    // 1. Load quiz
    const quiz = await Quiz.findById(quizId).populate("questionBanks.bank");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // 2. Check attempts
    // const attemptsCount = await QuizAttempt.countDocuments({
    //   quiz: quizId,
    //   student: userId,
    // });

    // if (attemptsCount >= quiz.attemptsAllowed) {
    //   return res.status(400).json({ message: "You have reached the maximum number of attempts" });
    // }

    // 3. Random questions from banks
    let selectedQuestions = [];

    for (const qb of quiz.questionBanks) {
      const { bank, numberOfQuestions } = qb;

      const questionsFromBank = await Question.find({ bank: bank._id, isActive: true });

      if (questionsFromBank.length < numberOfQuestions) {
        return res.status(400).json({
          message: `Not enough questions in bank: ${bank.title}`,
        });
      }

      const shuffled = shuffle([...questionsFromBank]);
      selectedQuestions.push(...shuffled.slice(0, numberOfQuestions));
    }

    // 4. Shuffle final question list if needed
    if (quiz.randomOrder) {
      selectedQuestions = shuffle(selectedQuestions);
    }

    // 5. Prepare attempt questions (do not expose correctAnswer)
    const sanitizedQuestions = selectedQuestions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options?.map(({ label, text }) => ({ label, text })),
      tags: q.tags,
      difficulty: q.difficulty,
    }));

    // 6. Compute expiration time
    let expiresAt = null;
    if (quiz.timeLimit > 0) {
      expiresAt = new Date(Date.now() + quiz.timeLimit * 60 * 1000);
    }

    // 7. Create QuizAttempt
    // const attempt = await QuizAttempt.create({
    //   quiz: quizId,
    //   student: userId,
    //   questions: sanitizedQuestions.map((q) => ({
    //     question: q._id,
    //     userAnswer: [],
    //   })),
    //   expiresAt,
    // });

    // 8. Response
    res.status(200).json({
      message: "Quiz started",
      quizId: quiz._id,
      title: quiz.title,
      timeLimit: quiz.timeLimit,
      expiresAt,
      questions: sanitizedQuestions,
    });

  } catch (error) {
    console.error("Error starting quiz:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
