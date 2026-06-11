const ApiResponse = require("../utils/ApiResponse");
const adminDetails = require("../models/details/admin-details.model");

const requireAdmin = async (req, res, next) => {
  try {
    if (req.userRole === "admin") return next();

    // Backward-compatible fallback for older tokens without role
    const admin = await adminDetails.findById(req.userId).select("_id");
    if (!admin) {
      return ApiResponse.forbidden("Admin access required").send(res);
    }

    req.userRole = "admin";
    return next();
  } catch (error) {
    console.error("requireAdmin Error:", error);
    return ApiResponse.forbidden("Admin access required").send(res);
  }
};

module.exports = requireAdmin;
