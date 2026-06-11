const mongoose = require("mongoose");

const societyAchievementSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    achievedAt: { type: Date },
    link: { type: String, trim: true },

    createdByCoordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "SocietyCoordinator", required: true },
  },
  { timestamps: true }
);

const SocietyAchievement = mongoose.model("SocietyAchievement", societyAchievementSchema);

module.exports = SocietyAchievement;
