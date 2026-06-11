const mongoose = require("mongoose");

const societyProjectSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    techStack: { type: String, trim: true },
    link: { type: String, trim: true },

    createdByCoordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "SocietyCoordinator", required: true },
  },
  { timestamps: true }
);

const SocietyProject = mongoose.model("SocietyProject", societyProjectSchema);

module.exports = SocietyProject;
