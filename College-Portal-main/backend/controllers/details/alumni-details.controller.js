const alumniDetails = require("../../models/details/alumni-details.model");
const ApiResponse = require("../../utils/ApiResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { buildAuthCookieOptions } = require("../../utils/cookies");

const loginAlumniController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await alumniDetails.findOne({ email });
    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return ApiResponse.unauthorized("Invalid password").send(res);
    }

    const token = jwt.sign(
      { userId: user._id, role: "alumni" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieOptions = buildAuthCookieOptions(req);

    res.cookie("token", token, cookieOptions);
    res.cookie("user", JSON.stringify({ id: user._id, role: "alumni" }), {
      ...cookieOptions,
      httpOnly: false,
    });

    return ApiResponse.success({ token }, "Login successful").send(res);
  } catch (error) {
    console.error("Alumni Login Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyDetailsController = async (req, res) => {
  try {
    const user = await alumniDetails.findById(req.userId).select("-password -__v");
    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    return ApiResponse.success(user, "My Details Found!").send(res);
  } catch (error) {
    console.error("Alumni My Details Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  loginAlumniController,
  getMyDetailsController,
};
