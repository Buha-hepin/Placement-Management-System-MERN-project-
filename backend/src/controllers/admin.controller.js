// Admin controller: manage users, jobs, companies, approvals
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";

// Admin Dashboard - Get statistics
export const getAdminDashboard = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: "pending" });
    const approvedJobs = await Job.countDocuments({ status: "approved" });
    const rejectedJobs = await Job.countDocuments({ status: "rejected" });

    const stats = {
        totalStudents,
        totalCompanies,
        totalJobs,
        pendingJobs,
        approvedJobs,
        rejectedJobs
    };

    return res.status(200).json(
        new apiResponse(200, stats, "Dashboard stats retrieved successfully")
    );
});

// Get all students
export const getAllStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
        filter = {
            $or: [
                { fullname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { enrollmentNo: { $regex: search, $options: "i" } }
            ]
        };
    }

    const students = await User.find(filter)
        .select("-password -refreshToken")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(200, { students, totalCount, page, limit }, "Students retrieved successfully")
    );
});

// Get all companies
export const getAllCompanies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
        filter = {
            $or: [
                { companyName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };
    }

    const companies = await Company.find(filter)
        .select("-password -refreshToken")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const totalCount = await Company.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(200, { companies, totalCount, page, limit }, "Companies retrieved successfully")
    );
});

// Get jobs by company (admin)
export const getCompanyJobsByAdmin = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    if (!companyId) {
        throw new apierror(400, "Company ID is required");
    }

    const jobs = await Job.find({ companyId }).sort({ postedAt: -1 });

    return res.status(200).json(
        new apiResponse(200, jobs, "Company jobs retrieved successfully")
    );
});

// Delete student
export const deleteStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findByIdAndDelete(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    return res.status(200).json(
        new apiResponse(200, {}, "Student deleted successfully")
    );
});

// Delete company
export const deleteCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    if (!companyId) {
        throw new apierror(400, "Company ID is required");
    }

    const company = await Company.findByIdAndDelete(companyId);
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    // Delete all jobs posted by this company
    await Job.deleteMany({ companyId });

    return res.status(200).json(
        new apiResponse(200, {}, "Company and associated jobs deleted successfully")
    );
});


// Get all jobs (with filtering)
export const getAllJobs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status = "" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
        filter.status = status;
    }

    const jobs = await Job.find(filter)
        .populate("companyId", "companyName email location")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const totalCount = await Job.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(200, { jobs, totalCount, page, limit }, "Jobs retrieved successfully")
    );
});

// Get pending jobs for admin approval
export const getPendingJobs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ status: "pending" })
        .populate("companyId", "companyName email location")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    const totalCount = await Job.countDocuments({ status: "pending" });

    return res.status(200).json(
        new apiResponse(200, { jobs, totalCount, page, limit }, "Pending jobs retrieved successfully")
    );
});

// Approve job
export const approveJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        { status: "approved" },
        { new: true }
    );

    if (!job) {
        throw new apierror(404, "Job not found");
    }

    return res.status(200).json(
        new apiResponse(200, job, "Job approved successfully")
    );
});

// Reject job
export const rejectJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { reason } = req.body;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        { status: "rejected", rejectionReason: reason || "Rejected by admin" },
        { new: true }
    );

    if (!job) {
        throw new apierror(404, "Job not found");
    }

    return res.status(200).json(
        new apiResponse(200, job, "Job rejected successfully")
    );
});
