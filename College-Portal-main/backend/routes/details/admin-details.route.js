const express = require("express");
const router = express.Router();
const {
  getAllDetailsController,
  registerAdminController,
  updateDetailsController,
  deleteDetailsController,
  loginAdminController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  updateLoggedInPasswordController,
} = require("../../controllers/details/admin-details.controller");
const upload = require("../../middlewares/multer.middleware");
const auth = require("../../middlewares/auth.middleware");
const requireAdmin = require("../../middlewares/requireAdmin");
const { createAlumniController, listAlumniController, deleteAlumniController } = require("../../controllers/alumni-admin.controller");
const {
  listSocietiesAdmin,
  createSocietyAdmin,
  updateSocietyAdmin,
  deleteSocietyAdmin,
} = require("../../controllers/society/admin-society.controller");
const {
  listCoordinatorsAdmin,
  createCoordinatorAdmin,
  updateCoordinatorAdmin,
  deleteCoordinatorAdmin,
} = require("../../controllers/society/admin-coordinator.controller");

router.post("/register", upload.single("file"), registerAdminController);
router.post("/login", loginAdminController);
router.get("/my-details", auth, getMyDetailsController);

router.get("/", auth, getAllDetailsController);
router.patch("/:id", auth, upload.single("file"), updateDetailsController);
router.delete("/:id", auth, deleteDetailsController);
router.post("/forget-password", sendForgetPasswordEmail);
router.post("/update-password/:resetId", updatePasswordHandler);
router.post("/change-password", auth, updateLoggedInPasswordController);

// Alumni management (Admin only)
router.get("/alumni", auth, requireAdmin, listAlumniController);
router.post("/alumni", auth, requireAdmin, createAlumniController);
router.delete("/alumni/:id", auth, requireAdmin, deleteAlumniController);

// Societies (Admin only)
router.get("/societies", auth, requireAdmin, listSocietiesAdmin);
router.post("/societies", auth, requireAdmin, createSocietyAdmin);
router.patch("/societies/:id", auth, requireAdmin, updateSocietyAdmin);
router.delete("/societies/:id", auth, requireAdmin, deleteSocietyAdmin);

// Society Coordinators (Admin only)
router.get("/coordinators", auth, requireAdmin, listCoordinatorsAdmin);
router.post("/coordinators", auth, requireAdmin, createCoordinatorAdmin);
router.patch("/coordinators/:id", auth, requireAdmin, updateCoordinatorAdmin);
router.delete("/coordinators/:id", auth, requireAdmin, deleteCoordinatorAdmin);

module.exports = router;
