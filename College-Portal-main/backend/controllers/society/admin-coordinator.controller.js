const ApiResponse = require("../../utils/ApiResponse");
const SocietyCoordinator = require("../../models/society/coordinator.model");
const Society = require("../../models/society/society.model");
const StudentDetail = require("../../models/details/student-details.model");

const listCoordinatorsAdmin = async (req, res) => {
  try {
    const coordinators = await SocietyCoordinator.find()
      .select("-password -__v")
      .populate("studentId", "firstName lastName email status")
      .populate("societies", "name status")
      .sort({ createdAt: -1 });

    return ApiResponse.success(coordinators, "Coordinators fetched").send(res);
  } catch (error) {
    console.error("listCoordinatorsAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createCoordinatorAdmin = async (req, res) => {
  try {
    const { studentId, societyId, societies, status } = req.body;
    if (!studentId) return ApiResponse.badRequest("studentId is required").send(res);

    const student = await StudentDetail.findById(studentId).select("firstName lastName email status");
    if (!student) return ApiResponse.notFound("Student not found").send(res);
    if (student.status && student.status !== "active") {
      return ApiResponse.badRequest("Student is not active").send(res);
    }

    const email = String(student.email || "").trim().toLowerCase();
    if (!email) return ApiResponse.badRequest("Student email is missing").send(res);

    // Ensure one coordinator record per student email; create if absent.
    const exists = await SocietyCoordinator.findOne({ email });

    // Password is required by schema (legacy). Not used for login now.
    const password = process.env.COORDINATOR_DEFAULT_PASSWORD || `coordinator-${Math.random().toString(36).slice(2, 10)}`;

    const societyIds = [];
    if (societyId) societyIds.push(societyId);
    if (Array.isArray(societies) && societies.length) societyIds.push(...societies);

    const uniqueSocietyIds = [...new Set(societyIds.map(String))].filter(Boolean);
    if (uniqueSocietyIds.length > 1) {
      return ApiResponse.badRequest("Only one society can be assigned to a coordinator").send(res);
    }

    const assignedSocietyIds = uniqueSocietyIds.length ? [uniqueSocietyIds[0]] : [];
    if (assignedSocietyIds.length) {
      const count = await Society.countDocuments({ _id: { $in: assignedSocietyIds } });
      if (count !== assignedSocietyIds.length) {
        return ApiResponse.badRequest("Invalid society id").send(res);
      }
    }

    let coordinatorDoc;
    if (exists) {
      exists.firstName = String(student.firstName || exists.firstName).trim();
      exists.lastName = String(student.lastName || exists.lastName).trim();
      exists.studentId = student._id;
      exists.societies = assignedSocietyIds;
      if (status !== undefined) exists.status = status;
      coordinatorDoc = await exists.save();
    } else {
      coordinatorDoc = await SocietyCoordinator.create({
        studentId: student._id,
        firstName: String(student.firstName).trim(),
        lastName: String(student.lastName).trim(),
        email,
        password,
        status: status || "active",
        societies: assignedSocietyIds,
      });
    }

    const coordinator = await SocietyCoordinator.findById(coordinatorDoc._id)
      .select("-password -__v")
      .populate("studentId", "firstName lastName email status")
      .populate("societies", "name status");

    return ApiResponse.created(coordinator, "Coordinator assigned").send(res);
  } catch (error) {
    console.error("createCoordinatorAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateCoordinatorAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { societyId, societies, status } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;

    if (societyId !== undefined || societies !== undefined) {
      const societyIds = [];
      if (societyId) societyIds.push(societyId);
      if (Array.isArray(societies) && societies.length) societyIds.push(...societies);

      const uniqueSocietyIds = [...new Set(societyIds.map(String))].filter(Boolean);
      if (uniqueSocietyIds.length > 1) {
        return ApiResponse.badRequest("Only one society can be assigned to a coordinator").send(res);
      }

      const assignedSocietyIds = uniqueSocietyIds.length ? [uniqueSocietyIds[0]] : [];
      if (assignedSocietyIds.length) {
        const count = await Society.countDocuments({ _id: { $in: assignedSocietyIds } });
        if (count !== assignedSocietyIds.length) {
          return ApiResponse.badRequest("Invalid society id").send(res);
        }
      }

      updates.societies = assignedSocietyIds;
    }

    const updated = await SocietyCoordinator.findByIdAndUpdate(id, updates, { new: true })
      .select("-password -__v")
      .populate("studentId", "firstName lastName email status")
      .populate("societies", "name status");

    if (!updated) return ApiResponse.notFound("Coordinator not found").send(res);

    return ApiResponse.success(updated, "Coordinator updated").send(res);
  } catch (error) {
    console.error("updateCoordinatorAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteCoordinatorAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SocietyCoordinator.findByIdAndDelete(id);
    if (!deleted) return ApiResponse.notFound("Coordinator not found").send(res);
    return ApiResponse.success({ id }, "Coordinator deleted").send(res);
  } catch (error) {
    console.error("deleteCoordinatorAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  listCoordinatorsAdmin,
  createCoordinatorAdmin,
  updateCoordinatorAdmin,
  deleteCoordinatorAdmin,
};
