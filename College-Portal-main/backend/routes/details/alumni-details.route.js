const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware");

const {
  loginAlumniController,
  getMyDetailsController,
} = require("../../controllers/details/alumni-details.controller");
const { listMyConversations, listMessagesWithPartner } = require("../../controllers/chat.controller");

router.post("/login", loginAlumniController);
router.get("/my-details", auth, getMyDetailsController);
router.get("/chat/conversations", auth, listMyConversations);
router.get("/chat/with/:partnerId/messages", auth, listMessagesWithPartner);

module.exports = router;
