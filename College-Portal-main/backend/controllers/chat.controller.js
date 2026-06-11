const ApiResponse = require("../utils/ApiResponse");
const ChatConversation = require("../models/chat/conversation.model");
const ChatMessage = require("../models/chat/message.model");

const normalizeLimit = (limit) => {
  const parsed = Number(limit);
  if (!parsed || Number.isNaN(parsed)) return 50;
  return Math.max(1, Math.min(parsed, 200));
};

const getOrCreateConversation = async ({ studentId, alumniId }) => {
  try {
    return await ChatConversation.findOneAndUpdate(
      { studentId, alumniId },
      { $setOnInsert: { studentId, alumniId } },
      { new: true, upsert: true }
    );
  } catch (err) {
    // In case of race causing duplicate key
    return await ChatConversation.findOne({ studentId, alumniId });
  }
};

const createMessage = async ({ conversation, senderRole, senderId, text }) => {
  const message = await ChatMessage.create({
    conversationId: conversation._id,
    senderRole,
    senderId,
    text,
  });

  await ChatConversation.findByIdAndUpdate(conversation._id, {
    lastMessageAt: message.createdAt,
    lastMessageText: message.text,
    lastMessageSenderRole: senderRole,
  });

  return message;
};

const listMyConversations = async (req, res) => {
  try {
    if (!req.userRole || !["student", "alumni"].includes(req.userRole)) {
      return ApiResponse.forbidden("Chat not available for this user").send(res);
    }

    const query = req.userRole === "student" ? { studentId: req.userId } : { alumniId: req.userId };

    const conversations = await ChatConversation.find(query)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate(
        req.userRole === "student" ? "alumniId" : "studentId",
        req.userRole === "student"
          ? "firstName lastName email profile company position yearPassedOut branch bio"
          : "firstName middleName lastName email profile enrollmentNo branchId"
      );

    const data = conversations.map((c) => {
      const partner = req.userRole === "student" ? c.alumniId : c.studentId;
      return {
        _id: c._id,
        partner,
        lastMessageAt: c.lastMessageAt,
        lastMessageText: c.lastMessageText,
        lastMessageSenderRole: c.lastMessageSenderRole,
      };
    });

    return ApiResponse.success(data, "Conversations fetched").send(res);
  } catch (error) {
    console.error("List Conversations Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const listMessagesWithPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const limit = normalizeLimit(req.query.limit);

    if (!req.userRole || !["student", "alumni"].includes(req.userRole)) {
      return ApiResponse.forbidden("Chat not available for this user").send(res);
    }

    const conversation =
      req.userRole === "student"
        ? await ChatConversation.findOne({ studentId: req.userId, alumniId: partnerId })
        : await ChatConversation.findOne({ alumniId: req.userId, studentId: partnerId });

    if (!conversation) {
      return ApiResponse.success([], "No messages").send(res);
    }

    const messages = await ChatMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Return chronological order
    return ApiResponse.success(messages.reverse(), "Messages fetched").send(res);
  } catch (error) {
    console.error("List Messages Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  getOrCreateConversation,
  createMessage,
  listMyConversations,
  listMessagesWithPartner,
};
