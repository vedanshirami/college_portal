const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const requireCoordinator = require("../middlewares/requireCoordinator");

const {
  loginCoordinatorController,
  getMyCoordinatorDetails,
} = require("../controllers/society/coordinator-auth.controller");

const {
  listMySocieties,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/society/coordinator-content.controller");

router.post("/login", loginCoordinatorController);
router.get("/my-details", auth, requireCoordinator, getMyCoordinatorDetails);
router.get("/societies", auth, requireCoordinator, listMySocieties);

router.get("/societies/:societyId/events", auth, requireCoordinator, listEvents);
router.post("/societies/:societyId/events", auth, requireCoordinator, createEvent);
router.patch("/events/:eventId", auth, requireCoordinator, updateEvent);
router.delete("/events/:eventId", auth, requireCoordinator, deleteEvent);

router.get("/societies/:societyId/achievements", auth, requireCoordinator, listAchievements);
router.post("/societies/:societyId/achievements", auth, requireCoordinator, createAchievement);
router.patch("/achievements/:achievementId", auth, requireCoordinator, updateAchievement);
router.delete("/achievements/:achievementId", auth, requireCoordinator, deleteAchievement);

router.get("/societies/:societyId/projects", auth, requireCoordinator, listProjects);
router.post("/societies/:societyId/projects", auth, requireCoordinator, createProject);
router.patch("/projects/:projectId", auth, requireCoordinator, updateProject);
router.delete("/projects/:projectId", auth, requireCoordinator, deleteProject);

module.exports = router;
