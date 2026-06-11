const mongoose = require("mongoose");

const chatConversationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentDetail",
      required: true,
      index: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AlumniDetail",
      required: true,
      index: true,
    },
    lastMessageAt: { type: Date },
    lastMessageText: { type: String },
    lastMessageSenderRole: { type: String, enum: ["student", "alumni"] },
  },
  { timestamps: true }
);

chatConversationSchema.index({ studentId: 1, alumniId: 1 }, { unique: true });

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

module.exports = ChatConversation;
