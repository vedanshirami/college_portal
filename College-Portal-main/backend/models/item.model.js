const { mongoose } = require("mongoose");

const ItemSchema = mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentDetails",
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dateLost: {
        type: Date,
        required: true,
    },
    locationLost: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["lost", "found", "claimed"],
        required: true,
    },
    reportedBy: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: false,
    },
    contactPhone: {
        type: String,
        required: false,
    },
    imageUrl: {
        type: String,
    },
    claimRequests: [
        {
            claimerId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentDetails" },
            claimerName: { type: String, required: true },
            claimerEmail: { type: String, required: true },
            claimerPhone: { type: String },
            proofDescription: { type: String, required: true },
            additionalDetails: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
module.exports = mongoose.model("Item", ItemSchema);
   