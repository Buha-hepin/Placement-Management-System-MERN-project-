import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { Job } from "../models/job.model.js";
import { apiResponse } from "../utils/apiResponse.js";

// Get all approved jobs for students
export const getAllApprovedJobs = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, search = "", location = "", jobType = "" } = req.query;

    let filter = { status: "approved" };

    if (search) {
        filter.$or = [
            { jobTitle: { $regex: search, $options: "i" } },
            { companyName: { $regex: search, $options: "i" } },
            { jobDescription: { $regex: search, $options: "i" } }
        ];
    }

    if (location) {
        filter.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
        filter.jobType = jobType;
    }

    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ postedAt: -1 });

    const totalJobs = await Job.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(200, {
            jobs,
            totalJobs,
            page: parseInt(page),
            totalPages: Math.ceil(totalJobs / limit)
        }, "Jobs retrieved successfully")
    );
})

// Get single job details
export const getJobDetails = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findById(jobId).populate("companyId", "email location");
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    return res.status(200).json(
        new apiResponse(200, job, "Job details retrieved successfully")
    );
})

// Apply for a job (student applies)
export const applyForJob = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    const { studentId } = req.body;

    if (!jobId || !studentId) {
        throw new apierror(400, "Job ID and Student ID are required");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    // Check if already applied
    if (job.applicants.includes(studentId)) {
        throw new apierror(400, "You have already applied for this job");
    }

    job.applicants.push(studentId);
    await job.save();

    return res.status(200).json(
        new apiResponse(200, job, "Applied for job successfully")
    );
})

// Get jobs applied by student
export const getStudentApplications = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const jobs = await Job.find({ applicants: studentId });

    return res.status(200).json(
        new apiResponse(200, jobs, "Student applications retrieved successfully")
    );
})

// Create job (Company posts job)
export const createJob = asyncHandler(async(req,res)=>{
    const { companyId, companyName, jobTitle, jobDescription, requirements, location, salary, jobType, skills, minCGPA, applicationDeadline } = req.body;

    if (![jobTitle, jobDescription, companyName, location, applicationDeadline].every(field => field?.toString().trim().length > 0)) {
        throw new apierror(400, "All required fields must be filled");
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
        throw new apierror(400, "Requirements must be a non-empty array");
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        throw new apierror(400, "Skills must be a non-empty array");
    }

    const job = await Job.create({
        companyId,
        companyName,
        jobTitle,
        jobDescription,
        requirements,
        location,
        salary,
        jobType,
        skills,
        minCGPA,
        applicationDeadline,
        status: "pending"
    });

    return res.status(201).json(
        new apiResponse(201, job, "Job posted successfully and awaiting admin approval")
    );
})

// Get pending jobs (for admin)
export const getPendingJobs = asyncHandler(async(req,res)=>{
    const jobs = await Job.find({ status: "pending" }).populate("companyId", "companyName email");

    return res.status(200).json(
        new apiResponse(200, jobs, "Pending jobs retrieved successfully")
    );
})

// Approve job (Admin)
export const approveJob = asyncHandler(async(req,res)=>{
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
})

// Reject job (Admin)
export const rejectJob = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        { status: "rejected" },
        { new: true }
    );

    if (!job) {
        throw new apierror(404, "Job not found");
    }

    return res.status(200).json(
        new apiResponse(200, job, "Job rejected successfully")
    );
})
