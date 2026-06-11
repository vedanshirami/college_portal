const ApiResponse = require("../../utils/ApiResponse");
const SocietyCoordinator = require("../../models/society/coordinator.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { buildAuthCookieOptions } = require("../../utils/cookies");

const loginCoordinatorController = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!email || !password) {
      return ApiResponse.badRequest("email and password are required").send(res);
    }

    const user = await SocietyCoordinator.findOne({ email });
    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    if (user.status !== "active") {
      return ApiResponse.unauthorized("Account is inactive").send(res);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return ApiResponse.unauthorized("Invalid password").send(res);
    }

    const token = jwt.sign(
      { userId: user._id, role: "coordinator" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieOptions = buildAuthCookieOptions(req);

    res.cookie("token", token, cookieOptions);
    res.cookie("user", JSON.stringify({ id: user._id, role: "coordinator" }), {
      ...cookieOptions,
      httpOnly: false,
    });

    return ApiResponse.success({ token }, "Login successful").send(res);
  } catch (error) {
    console.error("Coordinator Login Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyCoordinatorDetails = async (req, res) => {
  try {
    const user = await SocietyCoordinator.findById(req.userId)
      .select("-password -__v")
      .populate("societies", "name status");

    if (!user) return ApiResponse.notFound("User not found").send(res);

    return ApiResponse.success(user, "My details").send(res);
  } catch (error) {
    console.error("getMyCoordinatorDetails Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  loginCoordinatorController,
  getMyCoordinatorDetails,
};
