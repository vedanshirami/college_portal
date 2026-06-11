const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const alumniDetailsSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Optional profile fields used by the Student Alumni UI
    profile: { type: String },
    company: { type: String },
    position: { type: String },
    yearPassedOut: { type: Number },
    branch: { type: String },
    bio: { type: String },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    password: { type: String, required: true },
  },
  { timestamps: true }
);

alumniDetailsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const alumniDetails = mongoose.model("AlumniDetail", alumniDetailsSchema);

module.exports = alumniDetails;
