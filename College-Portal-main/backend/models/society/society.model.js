const mongoose = require("mongoose");

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    coverImageUrl: { type: String, trim: true },
    website: { type: String, trim: true },

    contact: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },

    socials: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      x: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Society = mongoose.model("Society", societySchema);

module.exports = Society;
