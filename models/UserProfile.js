const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    dob: { type: Date },
    phone: { type: String },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    address: { type: String, default: "" },

    academicTitle: { type: String }, // ThS, TS, GS,...
    expertise: { type: String }, // chuyên ngành
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema, "userProfiles");
