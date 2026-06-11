const studentDetails = require("../models/details/student-details.model");
const getUserController = async (req, res) => {
    try {
        const {reporterId} = req.body;
        const reporter = await studentDetails.findById(reporterId).select('firstName lastName email phone');
        if(!reporter){
            return res.status(404).json({message: "Reporter not found"});
        }
        res.status(200).json({data: reporter, message: "Reporter details fetched successfully"});
    } catch (error) {
        console.error("Error fetching reporter details:", error);
        res.status(500).json({message: "Internal server error"});
    }
}
module.exports = {getUserController};