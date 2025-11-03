const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Course lesson management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - courseId
 *         - title
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *           example: "672600f9de2b8a17d2d57d90"
 *         courseId:
 *           type: string
 *           description: ID of the course this lesson belongs to
 *           example: "671df14f8c7b3a11e89f02a4"
 *         title:
 *           type: string
 *           example: "Introduction to Node.js"
 *         description:
 *           type: string
 *           example: "Overview of Node.js and its event-driven architecture"
 *         order:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           example: "2025-11-02T10:35:12.928Z"
 *         updatedAt:
 *           type: string
 *           example: "2025-11-02T10:35:12.928Z"
 */

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - title
 *               - order
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "6903bcd7c32f7b0406a35a92"
 *               title:
 *                 type: string
 *                 example: "Lesson 1: Getting Started"
 *               description:
 *                 type: string
 *                 example: "An introduction to the course objectives and structure."
 *               order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to add lesson to this course
 */
router.post("/", auth, authorize(["admin", "teacher"]), lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/course/{courseId}:
 *   get:
 *     summary: Get all lessons for a specific course
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Fetched lessons successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get("/course/:courseId", auth, lessonController.getLessonsByCourse);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a specific lesson (includes contents)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lesson
 *     responses:
 *       200:
 *         description: Fetched lesson successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Course not published yet
 *       404:
 *         description: Lesson not found
 */
router.get("/:id", auth, lessonController.getLessonById);

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update an existing lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lesson to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Lesson 2: Advanced Topics"
 *               description:
 *                 type: string
 *                 example: "In-depth explanation of advanced topics."
 *               order:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Lesson not found
 */
router.put("/:id", auth, authorize(["admin", "teacher"]), lessonController.updateLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the lesson to delete
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Lesson not found
 */
router.delete("/:id", auth, authorize(["admin", "teacher"]), lessonController.deleteLesson);

module.exports = router;
