const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");

/**
 * @desc    Sinh viên ghi danh vào khóa học
 * @route   POST /api/enrollments
 * @access  Student / Admin
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Missing courseId" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollment = await Enrollment.create({
      course: courseId,
      student: studentId,
    });

    return res.status(201).json({
      success: true,
      message: "Enrollment successful",
      data: enrollment,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error enrolling in course",
      error: err.message,
    });
  }
};

/**
 * @desc    Lấy danh sách ghi danh (admin hoặc theo sinh viên)
 * @route   GET /api/enrollments
 * @access  Admin / Student
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, courseId, studentId } = req.query;

    const filter = {};
    if (req.user.role === "student") {
      filter.student = req.user.id;
    } else {
      if (studentId) filter.student = studentId;
      if (courseId) filter.course = courseId;
    }

    const total = await Enrollment.countDocuments(filter);
    const enrollments = await Enrollment.find(filter)
      .populate("course", "title category level")
      .populate("student", "name email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: enrollments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Lấy chi tiết 1 ghi danh
 * @route   GET /api/enrollments/:id
 * @access  Admin / Student (nếu là của mình)
 */
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("course", "title description category level")
      .populate("student", "name email");

    if (!enrollment)
      return res.status(404).json({ success: false, message: "Enrollment not found" });

    // Student chỉ xem được ghi danh của mình
    if (req.user.role === "student" && enrollment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Cập nhật tiến độ học
 * @route   PUT /api/enrollments/:id/progress
 * @access  Student
 */
exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress < 0 || progress > 100)
      return res.status(400).json({ success: false, message: "Progress must be 0–100" });

    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { $set: { progress, lastAccessed: new Date() } },
      { new: true }
    );

    if (!enrollment)
      return res.status(404).json({ success: false, message: "Enrollment not found" });

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Cập nhật trạng thái ghi danh
 * @route   PUT /api/enrollments/:id/status
 * @access  Admin / Student
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Active", "Completed", "Dropped"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const filter =
      req.user.role === "student"
        ? { _id: req.params.id, student: req.user.id }
        : { _id: req.params.id };

    const enrollment = await Enrollment.findOneAndUpdate(
      filter,
      { $set: { status } },
      { new: true }
    );

    if (!enrollment)
      return res.status(404).json({ success: false, message: "Enrollment not found" });

    res.status(200).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Xóa ghi danh
 * @route   DELETE /api/enrollments/:id
 * @access  Admin / Student (nếu của mình)
 */
exports.deleteEnrollment = async (req, res) => {
  try {
    const filter =
      req.user.role === "student"
        ? { _id: req.params.id, student: req.user.id }
        : { _id: req.params.id };

    const deleted = await Enrollment.findOneAndDelete(filter);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Enrollment not found" });

    res.status(200).json({ success: true, message: "Enrollment removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkEnrollStudents = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;

    if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing courseId or studentIds",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const docs = studentIds.map((id) => ({
      course: courseId,
      student: id,
    }));

    const result = await Enrollment.insertMany(docs, { ordered: false })
      .catch((err) => {
        if (err.writeErrors) {
          return err.insertedDocs || [];
        }
        throw err;
      });

    res.status(201).json({
      success: true,
      message: "Bulk enrollment completed",
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("❌ Error bulk enrolling:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
