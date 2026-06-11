const Item = require("../models/item.model");
const ApiResponse = require("../utils/ApiResponse");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");
const studentDetails = require("../models/details/student-details.model");
const { sendClaimEmailToReporter } = require("../utils/sendgrid");

const ReportLostItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            dateLost,
            locationLost,
            status,
            reportedBy,
            contactEmail,
            contactPhone,
        } = req.body;

        const reporterId = req.userId;

        if (!reporterId || !itemName || !category || !description || !dateLost || !locationLost) {
            return ApiResponse.badRequest("Missing required fields").send(res);
        }

        let imageUrl = "";
        if (req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer, {
                folder: "college/lost-and-found",
                transformation: [{ width: 1200, height: 900, crop: "limit" }],
            });
            imageUrl = result.secure_url;
        }

        const newItem = await Item.create({
            reporterId,
            itemName,
            category,
            description,
            dateLost: new Date(dateLost),
            locationLost,
            status: status || "lost",
            reportedBy: reportedBy || "Anonymous",
            contactEmail: contactEmail || "",
            contactPhone: contactPhone || "",
            imageUrl,
        });

        return ApiResponse.created(newItem, "Item reported successfully").send(res);
    } catch (error) {
        console.error("Error reporting lost item: ", error);
        return ApiResponse.internalServerError("Internal Server Error").send(res);
    }
};

const GetLostItems = async (req, res) => {
    try {
        const items = await Item.find({}).sort({ createdAt: -1 });
        return ApiResponse.success(items, "Items fetched successfully").send(res);
    } catch (error) {
        console.error("Error fetching items: ", error);
        return ApiResponse.internalServerError("Internal Server Error").send(res);
    }
};

const ClaimLostItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { claimerName, claimerEmail, claimerPhone, proofDescription, additionalDetails } = req.body;

        if (!claimerName || !claimerEmail || !proofDescription) {
            return ApiResponse.badRequest("Please fill in all required fields").send(res);
        }

        const item = await Item.findById(id);
        if (!item) {
            return ApiResponse.notFound("Item not found").send(res);
        }
        if (item.status === "claimed") {
            return ApiResponse.conflict("Item is already marked as claimed").send(res);
        }

        const claim = {
            claimerId: req.userId,
            claimerName,
            claimerEmail,
            claimerPhone: claimerPhone || "",
            proofDescription,
            additionalDetails: additionalDetails || "",
        };

        item.claimRequests = item.claimRequests || [];
        item.claimRequests.push(claim);
        await item.save();

        const reporter = await studentDetails.findById(item.reporterId).select("firstName lastName email");
        const reporterEmail = reporter?.email || item.contactEmail;
        if (!reporterEmail) {
            return ApiResponse.internalServerError("Reporter email not found").send(res);
        }

        await sendClaimEmailToReporter({
            reporterEmail,
            reporterName: reporter ? `${reporter.firstName || ""} ${reporter.lastName || ""}`.trim() : "",
            item,
            claim,
        });

        return ApiResponse.success({ itemId: item._id }, "Claim request sent to reporter").send(res);
    } catch (error) {
        console.error("Error claiming item: ", error);
        return ApiResponse.internalServerError("Internal Server Error").send(res);
    }
};

const MarkItemClaimed = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) {
            return ApiResponse.notFound("Item not found").send(res);
        }

        // Only the reporter can mark it claimed
        if (String(item.reporterId) !== String(req.userId)) {
            return ApiResponse.forbidden("Only the reporter can mark this item as claimed").send(res);
        }

        item.status = "claimed";
        await item.save();
        return ApiResponse.success(item, "Item marked as claimed").send(res);
    } catch (error) {
        console.error("Error marking item claimed: ", error);
        return ApiResponse.internalServerError("Internal Server Error").send(res);
    }
};

module.exports = {
    ReportLostItem,
    GetLostItems,
        ClaimLostItem,
        MarkItemClaimed,
};