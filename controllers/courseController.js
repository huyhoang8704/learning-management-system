const Course = require("../models/Course");
const Category = require("../models/Category");
const slugify = require("slugify");
const supabase = require("../config/supabase");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, categoryId, level } = req.body;
    let thumbnailUrl = "";
    const instructorId = req.user.id;

    // Upload ảnh lên Supabase nếu có
    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}-${slugify(title)}.${file.originalname.split(".").pop()}`;

      const { data, error } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      // Lấy public URL
      const { data: publicUrlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      thumbnailUrl = publicUrlData.publicUrl;
    }

    const newCourse = await Course.create({
      title,
      description,
      categoryId,
      instructorId,
      level,
      thumbnail: thumbnailUrl,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: err.message,
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, level, sort } = req.query;

    const baseFilter =
      req.user?.role === "admin" || req.user?.role === "teacher"
        ? {}
        : { isPublished: true };

    const filter = { ...baseFilter };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.$or = [
        { "category.slug": category },
        { "category.name": category },
      ];
    }

    if (level) {
      filter.level = level;
    }

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .populate("categoryId", "name slug")
      .populate("instructorId", "name email role")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Fetched courses successfully",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: courses,
    });
  } catch (error) {
    console.error("❌ Error in getAllCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("categoryId", "name slug")
      .populate("instructorId", "name email")
      .populate({
        path: "lessons", // tên virtual populate trong Course model (nếu có)
        options: { sort: { order: 1 } }, // sắp xếp theo thứ tự
        populate: {
          path: "contents", // populate lesson contents
          options: { sort: { order: 1 } },
        },
      });

    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    if (!course.isPublished && req.user?.role === "student") {
      return res.status(403).json({ success: false, message: "Course not published yet" });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched course successfully",
      data: course,
    });
  } catch (error) {
    console.error("❌ Error in getCourseBySlug:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, level } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let thumbnailUrl = course.thumbnail;

    // === Nếu có upload ảnh mới ===
    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}-${slugify(title || course.title)}.${file.originalname.split(".").pop()}`;

      const { data, error } = await supabase.storage
        .from("course-thumbnails")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(fileName);

      thumbnailUrl = publicUrlData.publicUrl;
    }

    // === Cập nhật thông tin ===
    course.title = title || course.title;
    course.description = description || course.description;
    course.categoryId = categoryId || course.categoryId;
    course.level = level || course.level;
    course.thumbnail = thumbnailUrl;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({
      success: false,
      message: "Error updating course",
      error: err.message,
    });
  }
};

// ✅ Publish / Unpublish course (Admin only)
exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    course.isPublished = !course.isPublished;
    await course.save();

    return res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete course (Admin / Instructor = owner)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    if (
      req.user.role !== "admin" &&
      req.user.id.toString() !== course.instructorId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await course.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
