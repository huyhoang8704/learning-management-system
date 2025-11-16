const express = require("express");
const router = express.Router();
const quizAttemptController = require("../controllers/quizAttemptController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

// Sinh viên bắt đầu quiz
router.post("/quizzes/:id/start", auth, authorize("student"), quizAttemptController.startQuiz);

// Sinh viên nộp bài
router.post("/quiz-attempts/:attemptId/submit", auth, authorize("student"), quizAttemptController.submitQuiz);

// Xem attempt chi tiết
router.get("/quiz-attempts/:attemptId", auth, quizAttemptController.getAttemptById);

// Teacher/Admin xem tất cả attempt 1 quiz
router.get("/quizzes/:quizId/attempts", auth, authorize("teacher", "admin"), quizAttemptController.getAllAttemptsForQuiz);

// Sinh viên xem lịch sử attempt
router.get("/my-attempts", auth, authorize("student"), quizAttemptController.getMyAttempts);

module.exports = router;
