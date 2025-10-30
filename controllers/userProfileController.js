const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const slugify = require("slugify");
const supabase = require('../config/supabase');


const getMyProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "gender",
      "dob",
      "phone",
      "bio",
      "address",
      "academicTitle",
      "expertise",
    ];

    const updateData = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== null)
        updateData[key] = req.body[key];
    });

    if (req.file) {
      const file = req.file;
      const fileName = `${Date.now()}-${slugify(
        req.user.name || req.user.email || "user"
      )}.${file.originalname.split(".").pop()}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      updateData.avatarUrl = publicUrlData.publicUrl;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


const getAllProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile.find().populate('user', 'name email role');
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getProfileById = async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.id).populate('user', 'name email role');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteProfile = async (req, res) => {
  try {
    await UserProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllProfiles,
  getProfileById,
  deleteProfile,
};
