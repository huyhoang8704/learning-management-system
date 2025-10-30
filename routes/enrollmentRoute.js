const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment management APIs
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     description: |
 *       - **Student**: Enroll themselves in a specific course.  
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "6903bcd7c32f7b0406a35a92"
 *     responses:
 *       201:
 *         description: Enrollment(s) created successfully
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
 *                   example: "Enrollment successful"
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing or invalid input data
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get all enrollments
 *     description: |
 *       - **Admin**: Get all enrollments in the system.  
 *       - **Student**: Get only their own enrollments.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Completed, Dropped]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get a specific enrollment by ID
 *     description: Retrieve detailed information about a single enrollment record.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Enrollment not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/enrollments/{id}/progress:
 *   put:
 *     summary: Update student's course progress
 *     description: Allows a student to update their learning progress in a specific course (0–100%).
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 example: 75
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Invalid progress value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 */

/**
 * @swagger
 * /api/enrollments/{id}/status:
 *   put:
 *     summary: Update enrollment status
 *     description: Admin or student can update the enrollment status (`Active`, `Completed`, or `Dropped`).
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Completed, Dropped]
 *                 example: "Completed"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Enrollment not found
 */

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete an enrollment
 *     description: |
 *       - **Student**: Can withdraw from their own enrollment.  
 *       - **Admin**: Can remove any enrollment record.
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Enrollment not found
 */

/**
 * @swagger
 * /api/enrollments/bulk:
 *   post:
 *     summary: Bulk enroll multiple students into a course (Admin only)
 *     description: |
 *       Allows **admin** to enroll multiple students into a single course at once.
 *       Duplicate enrollments are automatically skipped.
 *     tags: [Enrollments]
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
 *               - studentIds
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "671f9b7fd27c1234abcd5678"
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["671f9b7fd27c0001abcd1000", "671f9b7fd27c0001abcd1001"]
 *     responses:
 *       201:
 *         description: Bulk enrollment completed successfully
 *       400:
 *         description: Missing courseId or studentIds
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671fa122a1234abcd5678901"
 *         course:
 *           type: string
 *           example: "671f9b7fd27c1234abcd5678"
 *         student:
 *           type: string
 *           example: "671f9b7fd27c0001abcd1000"
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-31T08:00:00.000Z"
 *         progress:
 *           type: number
 *           example: 25
 *         status:
 *           type: string
 *           enum: [Active, Completed, Dropped]
 *           example: "Active"
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           example: "2025-10-31T10:15:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-31T08:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-31T10:30:00.000Z"
 */

router.post("/", auth, authorize("student", "admin"), enrollmentController.enrollCourse);
router.get("/", auth, authorize("student", "admin"), enrollmentController.getAllEnrollments);
router.get("/:id", auth, authorize("student", "admin"), enrollmentController.getEnrollmentById);
router.put("/:id/progress", auth, authorize("student"), enrollmentController.updateProgress);
router.put("/:id/status", auth, authorize("student", "admin"), enrollmentController.updateStatus);
router.delete("/:id", auth, authorize("student", "admin"), enrollmentController.deleteEnrollment);
router.post("/bulk", auth, authorize("admin"), enrollmentController.bulkEnrollStudents);


module.exports = router;
