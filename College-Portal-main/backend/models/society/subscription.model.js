const mongoose = require("mongoose");

const societySubscriptionSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

societySubscriptionSchema.index({ societyId: 1, email: 1 }, { unique: true });

const SocietySubscription = mongoose.model("SocietySubscription", societySubscriptionSchema);

module.exports = SocietySubscription;
