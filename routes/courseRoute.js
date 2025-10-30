const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middlewares/authTokenMiddleware");
const { authorize } = require("../middlewares/authRoleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "ReactJS Fundamentals"
 *               description:
 *                 type: string
 *                 example: "Khóa học nền tảng về ReactJS, bao gồm hooks, router và state management."
 *               categoryId:
 *                 type: string
 *                 example: "69032935c3d709807d726ffc"
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "beginner"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh thumbnail (tùy chọn)
 *     responses:
 *       201:
 *         description: Khóa học được tạo thành công
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
 *                   example: "Course created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671ef4e68a1b2b001f4e9982"
 *                     title:
 *                       type: string
 *                       example: "ReactJS Fundamentals"
 *                     description:
 *                       type: string
 *                       example: "Khóa học nền tảng về ReactJS, bao gồm hooks, router và state management."
 *                     category:
 *                       type: string
 *                       example: "Web Development"
 *                     instructor:
 *                       type: string
 *                       example: "Nguyễn Văn A"
 *                     level:
 *                       type: string
 *                       example: "Beginner"
 *                     thumbnail:
 *                       type: string
 *                       example: "https://xyz.supabase.co/storage/v1/object/public/course-thumbnails/123-reactjs.png"
 *       400:
 *         description: Thiếu dữ liệu yêu cầu
 *       500:
 *         description: Lỗi server khi tạo khóa học
 */
router.post("/", auth, authorize(["admin", "teacher"]), upload.single("thumbnail"), courseController.createCourse);



/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course (Teacher/Admin)
 *     description: Cho phép **teacher** hoặc **admin** cập nhật thông tin của một khóa học. Có thể thay đổi thông tin cơ bản hoặc upload ảnh thumbnail mới.
 *     tags: [Course]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của khóa học cần cập nhật
 *         schema:
 *           type: string
 *           example: "6903bcd7c32f7b0406a35a92"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "ReactJS Advanced Concepts"
 *               description:
 *                 type: string
 *                 example: "Khóa học nâng cao về ReactJS, bao gồm performance optimization và Redux."
 *               categoryId:
 *                 type: string
 *                 example: "69032935c3d709807d726ffc"
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "advanced"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh thumbnail mới (tùy chọn)
 *     responses:
 *       200:
 *         description: Cập nhật khóa học thành công
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
 *                   example: "Course updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671ef4e68a1b2b001f4e9982"
 *                     title:
 *                       type: string
 *                       example: "ReactJS Advanced Concepts"
 *                     description:
 *                       type: string
 *                       example: "Khóa học nâng cao về ReactJS, bao gồm performance optimization và Redux."
 *                     categoryId:
 *                       type: string
 *                     instructorId:
 *                       type: string
 *                     level:
 *                       type: string
 *                       example: "advanced"
 *                     thumbnail:
 *                       type: string
 *                       example: "https://xyz.supabase.co/storage/v1/object/public/course-thumbnails/updated-reactjs.png"
 *       404:
 *         description: Không tìm thấy khóa học
 *       500:
 *         description: Lỗi server khi cập nhật khóa học
 */
router.put(
  "/:id",
  auth,
  authorize(["admin", "teacher"]),
  upload.single("thumbnail"),
  courseController.updateCourse
);


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
