const ApiResponse = require("../utils/ApiResponse");
const StudentDetail = require("../models/details/student-details.model");
const SocietyCoordinator = require("../models/society/coordinator.model");

const requireCoordinator = async (req, res, next) => {
  try {
    // Backward-compatible: allow dedicated coordinator tokens
    if (req.userRole === "coordinator") {
      req.coordinatorId = req.userId;
      return next();
    }

    // New behavior: coordinator is a student; verify assignment by email.
    if (req.userRole === "student") {
      const student = await StudentDetail.findById(req.userId).select("email status");
      if (!student || student.status !== "active") {
        return ApiResponse.unauthorized("Coordinator access required").send(res);
      }

      const email = String(student.email || "").trim().toLowerCase();
      if (!email) return ApiResponse.unauthorized("Coordinator access required").send(res);

      const coord = await SocietyCoordinator.findOne({ email, status: "active" }).select("_id");
      if (!coord) return ApiResponse.unauthorized("Coordinator access required").send(res);

      req.coordinatorId = coord._id;
      return next();
    }

    return ApiResponse.unauthorized("Coordinator access required").send(res);
  } catch (error) {
    console.error("requireCoordinator Error:", error);
    return ApiResponse.unauthorized("Coordinator access required").send(res);
  }
};

module.exports = requireCoordinator;
