const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const societyCoordinatorSchema = new mongoose.Schema(
  {
    // Coordinator is an existing student (optional for backward compatibility)
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentDetail" },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },

    // One society only (store as array with max 1 for backward compatibility)
    societies: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Society" }],
      validate: {
        validator: (arr) => !arr || arr.length <= 1,
        message: "Coordinator can be assigned to only one society",
      },
      default: [],
    },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

societyCoordinatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const SocietyCoordinator = mongoose.model("SocietyCoordinator", societyCoordinatorSchema);

module.exports = SocietyCoordinator;
