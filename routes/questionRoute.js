const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Question
 *   description: Manage questions within question banks
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           example: "A"
 *         text:
 *           type: string
 *           example: "A JavaScript runtime"
 *         isCorrect:
 *           type: boolean
 *           example: true
 *     QuestionInput:
 *       type: object
 *       required:
 *         - questionText
 *         - type
 *       properties:
 *         questionText:
 *           type: string
 *           example: "What is Node.js?"
 *         type:
 *           type: string
 *           enum: [single, multiple, true_false, fill_blank, essay]
 *           example: "single"
 *         options:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Option"
 *         correctAnswers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Tokyo"]
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: "medium"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["javascript", "backend"]
 *         explanation:
 *           type: string
 *           example: "Node.js allows JS to run on server side"
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/questions/{bankId}:
 *   post:
 *     summary: Create multiple questions in a question bank (Teacher/Admin only)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6908a75cd32e9b8b5f7539a5"
 *         description: ID of the question bank
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/QuestionInput"
 *     responses:
 *       201:
 *         description: Questions created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/:bankId",
  auth,
  authorize(["teacher", "admin"]),
  questionController.createQuestions
);

/**
 * @swagger
 * /api/questions/{bankId}:
 *   get:
 *     summary: Get all questions in a question bank (Teacher/Admin only)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bankId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [single, multiple, true_false, fill_blank, essay]
 *         description: Filter by question type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by question text
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active/inactive
 *     responses:
 *       200:
 *         description: Fetched questions successfully
 */
router.get(
  "/:bankId",
  auth,
  authorize(["teacher", "admin"]),
  questionController.getQuestionsByBank
);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID (Authenticated users)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Fetched question successfully
 *       404:
 *         description: Question not found
 */
router.get("/:id", auth, questionController.getQuestionById);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update question by ID (Teacher/Admin only)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/QuestionInput"
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
router.put(
  "/:id",
  auth,
  authorize(["teacher", "admin"]),
  questionController.updateQuestion
);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete question (Teacher/Admin only)
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
router.delete(
  "/:id",
  auth,
  authorize(["teacher", "admin"]),
  questionController.deleteQuestion
);

module.exports = router;
