const express = require("express");
const router = express.Router();
const {
  loginStudentController,
  getAllDetailsController,
  registerStudentController,
  updateDetailsController,
  deleteDetailsController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  searchStudentsController,
  updateLoggedInPasswordController,
} = require("../../controllers/details/student-details.controller");
const { getUserController } = require("../../controllers/getUsercontroller");
const upload = require("../../middlewares/multer.middleware");
const auth = require("../../middlewares/auth.middleware");
const { ReportLostItem, GetLostItems, ClaimLostItem, MarkItemClaimed } = require("../../controllers/itemcontroller");
const { listAlumniForStudentsController } = require("../../controllers/alumni-student.controller");
const { listMyConversations, listMessagesWithPartner } = require("../../controllers/chat.controller");
const multer = require("multer");

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/register", upload.single("file"), registerStudentController);
router.post("/login", loginStudentController);
router.get("/my-details", auth, getMyDetailsController);
router.post("/get-reporter-details", auth, getUserController);
router.post("/lost-and-found/report", auth, uploadMemory.single("image"), ReportLostItem);
router.post("/lost-and-found/claim/:id", auth, ClaimLostItem);
router.patch("/lost-and-found/mark-claimed/:id", auth, MarkItemClaimed);
router.get("/items", auth, GetLostItems);
router.get("/alumni/list", auth, listAlumniForStudentsController);
router.get("/chat/conversations", auth, listMyConversations);
router.get("/chat/with/:partnerId/messages", auth, listMessagesWithPartner);
router.get("/", auth, getAllDetailsController);
router.patch("/:id", auth, upload.single("file"), updateDetailsController);
router.delete("/:id", auth, deleteDetailsController);
router.post("/forget-password", sendForgetPasswordEmail);
router.post("/update-password/:resetId", updatePasswordHandler);
router.post("/change-password", auth, updateLoggedInPasswordController);
router.post("/search", auth, searchStudentsController);

module.exports = router;
