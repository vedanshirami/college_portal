const ApiResponse = require("../utils/ApiResponse");
const alumniDetails = require("../models/details/alumni-details.model");

const listAlumniForStudentsController = async (req, res) => {
  try {
    const alumni = await alumniDetails
      .find({ status: "active" })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    return ApiResponse.success(alumni, "Alumni list fetched").send(res);
  } catch (error) {
    console.error("Student Alumni List Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  listAlumniForStudentsController,
};
