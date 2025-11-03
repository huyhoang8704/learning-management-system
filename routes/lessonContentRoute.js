const express = require("express");
const router = express.Router();
const lessonContentController = require("../controllers/lessonContentController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");
const upload = require("../middlewares/uploadMiddleware"); // middleware multer upload

/**
 * @swagger
 * tags:
 *   name: LessonContents
 *   description: Manage contents (video, file, reading, quiz) inside a lesson
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonContent:
 *       type: object
 *       required:
 *         - lesson
 *         - type
 *         - title
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *           example: "672610f9de2b8a17d2d57d90"
 *         lesson:
 *           type: string
 *           example: "672600f9de2b8a17d2d57d90"
 *         type:
 *           type: string
 *           enum: ["Video", "Reading", "File", "Quiz"]
 *           example: "Video"
 *         title:
 *           type: string
 *           example: "Part 1: Node.js Event Loop"
 *         content:
 *           type: string
 *           example: "<p>This section explains the Node.js event loop...</p>"
 *         videoUrl:
 *           type: string
 *           example: "https://xyz.supabase.co/storage/v1/object/public/lesson-videos/173066999.mp4"
 *         fileUrl:
 *           type: string
 *           example: "https://xyz.supabase.co/storage/v1/object/public/lesson-files/slide1.pdf"
 *         duration:
 *           type: number
 *           example: 10
 *         order:
 *           type: number
 *           example: 1
 */

/**
 * @swagger
 * /api/lesson-contents:
 *   post:
 *     summary: Create a new lesson content
 *     tags: [LessonContents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lesson:
 *                 type: string
 *                 example: "69086f7666277f25d180f0ca"
 *               type:
 *                 type: string
 *                 enum: ["Video", "Reading", "File", "Quiz"]
 *                 example: "Video"
 *               title:
 *                 type: string
 *                 example: "Lesson 1: Introduction Video"
 *               content:
 *                 type: string
 *                 example: "Welcome to the course!"
 *               duration:
 *                 type: number
 *                 example: 8
 *               order:
 *                 type: number
 *                 example: 1
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lesson content created successfully
 *       400:
 *         description: Invalid request data
 */
router.post(
  "/",
  auth,
  authorize(["admin", "teacher"]),
  upload.single("file"),
  lessonContentController.createLessonContent
);

/**
 * @swagger
 * /api/lesson-contents/lesson/{lessonId}:
 *   get:
 *     summary: Get all contents of a lesson
 *     tags: [LessonContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         schema:
 *           type: string
 *         required: true
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Fetched lesson contents successfully
 *       404:
 *         description: Lesson not found
 */
router.get("/lesson/:lessonId", auth, lessonContentController.getContentsByLesson);

/**
 * @swagger
 * /api/lesson-contents/{id}:
 *   get:
 *     summary: Get a specific lesson content
 *     tags: [LessonContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lesson content ID
 *     responses:
 *       200:
 *         description: Fetched lesson content successfully
 *       404:
 *         description: Lesson content not found
 */
router.get("/:id", auth, lessonContentController.getLessonContentById);

/**
 * @swagger
 * /api/lesson-contents/{id}:
 *   put:
 *     summary: Update a lesson content
 *     tags: [LessonContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lesson content ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Lesson Video"
 *               content:
 *                 type: string
 *                 example: "<p>Updated lesson description...</p>"
 *               duration:
 *                 type: number
 *                 example: 15
 *               order:
 *                 type: number
 *                 example: 2
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lesson content updated successfully
 *       404:
 *         description: Lesson content not found
 */
router.put(
  "/:id",
  auth,
  authorize(["admin", "teacher"]),
  upload.single("file"),
  lessonContentController.updateLessonContent
);

/**
 * @swagger
 * /api/lesson-contents/{id}:
 *   delete:
 *     summary: Delete a lesson content
 *     tags: [LessonContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Lesson content ID
 *     responses:
 *       200:
 *         description: Lesson content deleted successfully
 *       404:
 *         description: Lesson content not found
 */
router.delete(
  "/:id",
  auth,
  authorize(["admin", "teacher"]),
  lessonContentController.deleteLessonContent
);

module.exports = router;
