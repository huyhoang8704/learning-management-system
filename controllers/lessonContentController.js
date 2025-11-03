const LessonContent = require("../models/LessonContent");
const Lesson = require("../models/Lesson");
const supabase = require("../config/supabase");

/**
 * ✅ Create a new LessonContent
 */
exports.createLessonContent = async (req, res) => {
  try {
    const { lesson, type, title, content, duration, order } = req.body;

    // Check lesson exists
    const foundLesson = await Lesson.findById(lesson);
    if (!foundLesson)
      return res.status(404).json({ success: false, message: "Lesson not found" });

    let videoUrl = "";
    let fileUrl = "";

    // Handle upload (if file present)
    if (req.file) {
      const file = req.file;
      const folder =
        type === "Video"
          ? "lesson-videos"
          : type === "File"
          ? "lesson-files"
          : "lesson-uploads";
      const fileName = `${Date.now()}-${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);

      if (type === "Video") videoUrl = publicUrlData.publicUrl;
      if (type === "File") fileUrl = publicUrlData.publicUrl;
    }

    const newContent = await LessonContent.create({
      lesson,
      type,
      title,
      content,
      duration,
      order,
      videoUrl,
      fileUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Lesson content created successfully",
      data: newContent,
    });
  } catch (error) {
    console.error("Error creating lesson content:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating lesson content",
      error: error.message,
    });
  }
};

/**
 * ✅ Get contents by lesson
 */
exports.getContentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const contents = await LessonContent.find({ lesson: lessonId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "Fetched lesson contents successfully",
      data: contents,
    });
  } catch (error) {
    console.error("Error fetching lesson contents:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching lesson contents",
      error: error.message,
    });
  }
};

/**
 * ✅ Get a single content
 */
exports.getLessonContentById = async (req, res) => {
  try {
    const content = await LessonContent.findById(req.params.id).populate("lesson");
    if (!content)
      return res.status(404).json({ success: false, message: "Lesson content not found" });

    return res.status(200).json({
      success: true,
      message: "Fetched lesson content successfully",
      data: content,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching lesson content",
      error: error.message,
    });
  }
};

/**
 * ✅ Update a content
 */
exports.updateLessonContent = async (req, res) => {
  try {
    const { id } = req.params;
    const contentData = req.body;

    const content = await LessonContent.findById(id);
    if (!content)
      return res.status(404).json({ success: false, message: "Lesson content not found" });

    // Handle re-upload file/video if new file present
    if (req.file) {
      const file = req.file;
      const folder =
        contentData.type === "Video"
          ? "lesson-videos"
          : contentData.type === "File"
          ? "lesson-files"
          : "lesson-uploads";
      const fileName = `${Date.now()}-${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);

      if (contentData.type === "Video")
        content.videoUrl = publicUrlData.publicUrl;
      if (contentData.type === "File")
        content.fileUrl = publicUrlData.publicUrl;
    }

    Object.assign(content, contentData);
    await content.save();

    return res.status(200).json({
      success: true,
      message: "Lesson content updated successfully",
      data: content,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating lesson content",
      error: error.message,
    });
  }
};

/**
 * ✅ Delete a content
 */
exports.deleteLessonContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await LessonContent.findById(id);
    if (!content)
      return res.status(404).json({ success: false, message: "Lesson content not found" });

    await content.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Lesson content deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting lesson content",
      error: error.message,
    });
  }
};
