const express = require("express");
const router = express.Router();
const questionBankController = require("../controllers/questionBankController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: QuestionBank
 *   description: Manage question banks for quizzes
 */

/**
 * @swagger
 * /api/question-banks:
 *   get:
 *     summary: Get all question banks with pagination and search (Admin/Teacher only)
 *     tags: [QuestionBank]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Number of items per page (default: 10)"
 *     responses:
 *       200:
 *         description: Fetched all question banks successfully
 */
router.get("/", auth, authorize(["teacher", "admin"]), questionBankController.getAllQuestionBanks);

/**
 * @swagger
 * /api/question-banks/{id}:
 *   get:
 *     summary: Get question bank by ID (Admin/Teacher only)
 *     tags: [QuestionBank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Question bank ID"
 *     responses:
 *       200:
 *         description: Fetched question bank successfully
 *       404:
 *         description: Question bank not found
 */
router.get("/:id", auth, authorize(["teacher", "admin"]), questionBankController.getQuestionBankById);

/**
 * @swagger
 * /api/question-banks:
 *   post:
 *     summary: Create new question bank (Teacher/Admin only)
 *     tags: [QuestionBank]
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
 *                 example: "Basic JavaScript Questions"
 *               description:
 *                 type: string
 *                 example: "A collection of beginner JS questions"
 *               subject:
 *                 type: string
 *                 example: "JavaScript"
 *     responses:
 *       201:
 *         description: Question bank created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", auth, authorize("teacher", "admin"), questionBankController.createQuestionBank);

/**
 * @swagger
 * /api/question-banks/{id}:
 *   put:
 *     summary: Update question bank (Teacher/Admin only)
 *     tags: [QuestionBank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Question bank ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated JS Bank"
 *               description:
 *                 type: string
 *                 example: "Updated question collection"
 *               subject:
 *                 type: string
 *                 example: "Programming"
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       404:
 *         description: Question bank not found
 */
router.put("/:id", auth, authorize("teacher", "admin"), questionBankController.updateQuestionBank);

/**
 * @swagger
 * /api/question-banks/{id}:
 *   delete:
 *     summary: Delete question bank (Teacher/Admin only)
 *     tags: [QuestionBank]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "Question bank ID"
 *     responses:
 *       200:
 *         description: Question bank deleted successfully
 *       404:
 *         description: Question bank not found
 */
router.delete("/:id", auth, authorize("teacher", "admin"), questionBankController.deleteQuestionBank);

module.exports = router;
