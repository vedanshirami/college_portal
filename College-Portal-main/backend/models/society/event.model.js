const mongoose = require("mongoose");

const societyEventSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scheduledAt: { type: Date, required: true },
    venue: { type: String, trim: true },

    createdByCoordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "SocietyCoordinator", required: true },
  },
  { timestamps: true }
);

const SocietyEvent = mongoose.model("SocietyEvent", societyEventSchema);

module.exports = SocietyEvent;
