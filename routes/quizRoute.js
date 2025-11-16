const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Manage quizzes for LMS system
 */

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes (with search, course, lesson, pagination)
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search quiz by title
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Filter quizzes by course ID
 *       - in: query
 *         name: lesson
 *         schema:
 *           type: string
 *         description: Filter quizzes by lesson ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Page size for pagination
 *     responses:
 *       200:
 *         description: Fetched quizzes successfully
 */
router.get("/", quizController.getAllQuizzes);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Quiz ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz fetched successfully
 *       404:
 *         description: Quiz not found
 */
router.get("/:id", quizController.getQuizById);

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz (Teacher/Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Quiz 1: Java Basics"
 *               description:
 *                 type: string
 *                 example: "This quiz tests basic Java knowledge."
 *               course:
 *                 type: string
 *                 example: "6903bcd7c32f7b0406a35a92"
 *               lesson:
 *                 type: string
 *                 example: "69086f7666277f25d180f0ca"
 *               questionBanks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     bank:
 *                       type: string
 *                       example: "6908a75cd32e9b8b5f7539a5"
 *                     numberOfQuestions:
 *                       type: number
 *                       example: 10
 *               timeLimit:
 *                 type: number
 *                 example: 30
 *               attemptsAllowed:
 *                 type: number
 *                 example: 1
 *               randomOrder:
 *                 type: boolean
 *                 example: true
 *               passingScore:
 *                 type: number
 *                 example: 70
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */
router.post("/", auth, authorize("teacher", "admin"), quizController.createQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz (Teacher/Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               timeLimit:
 *                 type: number
 *               randomOrder:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       404:
 *         description: Quiz not found
 */
router.put("/:id", auth, authorize("teacher", "admin"), quizController.updateQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 */
router.delete("/:id", auth, authorize("admin"), quizController.deleteQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/start:
 *   post:
 *     summary: Start quiz (random questions from bank). Students only.
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz started successfully. Returns randomized questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizId:
 *                   type: string
 *                   example: "672abc12ff90aa88b1234567"
 *                 title:
 *                   type: string
 *                   example: "Java Basic Quiz"
 *                 timeLimit:
 *                   type: number
 *                   example: 30
 *                 attemptId:
 *                   type: string
 *                   example: "672acffff1290bbcc7890012"
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671fa012bcde90123abc1111"
 *                       questionText:
 *                         type: string
 *                         example: "What is JVM?"
 *                       type:
 *                         type: string
 *                         example: "single"
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "A"
 *                             text:
 *                               type: string
 *                               example: "Java Virtual Machine"
 *                 expiresAt:
 *                   type: string
 *                   example: "2025-11-14T10:30:00Z"
 *       404:
 *         description: Quiz not found
 *       400:
 *         description: Quiz cannot be started or no questions available
 */
router.post("/:id/start", auth, quizController.startQuiz);

module.exports = router;
