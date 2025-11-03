const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

/**
 * @desc Create a new lesson in a course
 * @route POST /api/lessons
 * @access Instructor/Admin
 */
exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, description, order, isPreview } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Chỉ instructor owner hoặc admin mới tạo được lesson
    if (
      req.user.role !== "admin" &&
      req.user.id.toString() !== course.instructorId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to add lesson to this course" });
    }

    const newLesson = await Lesson.create({
      course: courseId,
      title,
      description,
      order,
      isPreview: isPreview ?? false,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: newLesson,
    });
  } catch (error) {
    console.error("❌ Error creating lesson:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

/**
 * @desc Get all lessons of a course
 * @route GET /api/lessons/course/:courseId
 * @access Public (if course published) or authenticated to check role
 */
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // nếu course chưa publish và user là student -> block
    if (!course.isPublished && req.user?.role === "student") {
      return res.status(403).json({ success: false, message: "Course not published yet" });
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();

    return res.status(200).json({ success: true, message: "Fetched lessons successfully", data: lessons });
  } catch (error) {
    console.error("❌ Error getting lessons:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

/**
 * @desc Get a single lesson (populate contents virtual)
 * @route GET /api/lessons/:id
 * @access Public (if course published)
 */
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("contents");
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const course = await Course.findById(lesson.course);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!course.isPublished && req.user?.role === "student") {
      return res.status(403).json({ success: false, message: "Course not published yet" });
    }

    return res.status(200).json({ success: true, message: "Fetched lesson successfully", data: lesson });
  } catch (error) {
    console.error("❌ Error getting lesson:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

/**
 * @desc Update lesson
 * @route PUT /api/lessons/:id
 * @access Instructor/Admin
 */
exports.updateLesson = async (req, res) => {
  try {
    const { title, description, order, isPreview } = req.body;
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const course = lesson.course;
    if (
      req.user.role !== "admin" &&
      req.user.id.toString() !== course.instructorId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    lesson.title = title ?? lesson.title;
    lesson.description = description ?? lesson.description;
    lesson.order = order ?? lesson.order;
    lesson.isPreview = isPreview ?? lesson.isPreview;

    await lesson.save();

    return res.status(200).json({ success: true, message: "Lesson updated successfully", data: lesson });
  } catch (error) {
    console.error("❌ Error updating lesson:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

/**
 * @desc Delete lesson
 * @route DELETE /api/lessons/:id
 * @access Instructor/Admin
 */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const course = lesson.course;
    if (
      req.user.role !== "admin" &&
      req.user.id.toString() !== course.instructorId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Nếu bạn có LessonContent liên quan, cân nhắc xóa các content trước khi xóa lesson.
    await lesson.deleteOne();

    return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting lesson:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
