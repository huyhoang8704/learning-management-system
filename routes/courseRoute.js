const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Course
 *   description: Manage LMS courses
 */


/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses (with pagination, search, filter, sort)
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword to search by course title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID or slug
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by course level
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_asc, price_desc]
 *         description: Sort courses by specific field
 *     responses:
 *       200:
 *         description: List of courses fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 125
 *               page: 1
 *               totalPages: 13
 *               data:
 *                 - _id: "6712ac9d1d2f1f9b841b8123"
 *                   title: "JavaScript for Beginners"
 *                   category: { name: "Programming", slug: "programming" }
 *                   instructor: { name: "John Doe", email: "john@example.com" }
 *                   level: "beginner"
 *                   price: 49.99
 *                   isPublished: true
 */
router.get("/", auth, courseController.getAllCourses);

/**
 * @swagger
 * /api/courses/slug/{slug}:
 *   get:
 *     summary: Get course by slug
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course slug
 *     responses:
 *       200:
 *         description: Fetched course successfully
 *       404:
 *         description: Course not found
 */
router.get("/slug/:slug", auth, courseController.getCourseBySlug);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Teacher/Admin)
 *     description: Allows a **teacher** or **admin** to create a new course. Automatically generates slug from the course title.
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Mastering Node.js and Express"
 *               description:
 *                 type: string
 *                 example: "Learn how to build scalable web applications using Node.js, Express, and MongoDB."
 *               category:
 *                 type: string
 *                 description: ObjectId of category
 *                 example: "69032935c3d709807d726ffc"
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "intermediate"
 *               thumbnail:
 *                 type: string
 *                 description: URL to course thumbnail
 *                 example: "https://example.com/thumbnails/nodejs-course.png"
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671dcd9b8f3e3b1768b8ef2a"
 *                     title:
 *                       type: string
 *                       example: "Mastering Node.js and Express"
 *                     slug:
 *                       type: string
 *                       example: "mastering-node-js-and-express"
 *                     description:
 *                       type: string
 *                       example: "Learn how to build scalable web applications using Node.js, Express, and MongoDB."
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "671dcdf88f3e3b1768b8ef2b"
 *                         name:
 *                           type: string
 *                           example: "Web Development"
 *                         slug:
 *                           type: string
 *                           example: "web-development"
 *                     instructor:
 *                       type: string
 *                       example: "671dc9e48f3e3b1768b8ef1b"
 *                     level:
 *                       type: string
 *                       example: "intermediate"
 *                     isPublished:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-26T12:00:00.000Z"
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, authorize(["admin", "teacher"]), courseController.createCourse);


/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update an existing course (Admin or course owner)
 *     description: Allows **admin** or **teacher who owns the course** to update course details. Slug will auto-update if title changes.
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated: Node.js and Express Masterclass"
 *               description:
 *                 type: string
 *                 example: "Updated description with more advanced topics"
 *               category:
 *                 type: string
 *                 example: "671dcdf88f3e3b1768b8ef2b"
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "advanced"
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Course updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671dcd9b8f3e3b1768b8ef2a"
 *                     title:
 *                       type: string
 *                       example: "Updated: Node.js and Express Masterclass"
 *                     slug:
 *                       type: string
 *                       example: "updated-node-js-and-express-masterclass"
 *                     category:
 *                       type: string
 *                       example: "671dcdf88f3e3b1768b8ef2b"
 *                     level:
 *                       type: string
 *                       example: "advanced"
 *                     isPublished:
 *                       type: boolean
 *                       example: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-26T13:12:00.000Z"
 *       403:
 *         description: Not authorized to update this course
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth, authorize(["admin", "teacher"]), courseController.updateCourse);


/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     summary: Toggle publish/unpublish (Admin only)
 *     tags: [Course]
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
 *         description: Publish state changed successfully
 */
router.patch("/:id/publish", auth, authorize("admin"), courseController.togglePublish);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course (Admin/Owner only)
 *     tags: [Course]
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
 *         description: Course deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Course not found
 */
router.delete("/:id", auth, authorize(["admin", "teacher"]), courseController.deleteCourse);

module.exports = router;
