// Job controller: student browse/apply, company/admin manage jobs
// Note: Uses Application model for per-student application status
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { apiResponse } from "../utils/apiResponse.js";

// Get all approved jobs for students
// Query supports pagination + filters (search/location/jobType)
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
// Returns job and basic company info
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
// Creates an Application doc; also keeps quick applicants list on Job
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

    // Ensure not duplicate application
    const existing = await Application.findOne({ jobId, studentId });
    if (existing) {
        throw new apierror(400, "You have already applied for this job");
    }

    // Create application record
    const application = await Application.create({ jobId, studentId });

    // Maintain simple count list on Job for quick UI counts
    if (!job.applicants.includes(studentId)) {
        job.applicants.push(studentId);
        await job.save();
    }

    return res.status(200).json(
        new apiResponse(200, application, "Applied for job successfully")
    );
})

// Get jobs applied by student
// Joins Application with Job; flattens to job fields + application status
export const getStudentApplications = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    // Fetch application docs and populate job details
    const apps = await Application.find({ studentId })
        .sort({ createdAt: -1 })
        .populate({ path: 'jobId', select: '-applicants -__v' });

    // Map to shape expected by frontend: job fields + status
    const data = apps
        .filter(a => a.jobId)
        .map(a => ({
            ...a.jobId.toObject(),
            status: a.status,
            applicationId: a._id,
            appliedAt: a.appliedAt
        }));

    return res.status(200).json(
        new apiResponse(200, data, "Student applications retrieved successfully")
    );
})

// Get applicants for a specific job (Company views applicants)
export const getJobApplicants = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findById(jobId).select('jobTitle');
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    const apps = await Application.find({ jobId })
        .sort({ createdAt: -1 })
        .populate({ path: 'studentId', select: 'fullname email branch cgpa phone skills resumeUrl enrollmentNo' });

    const applicants = apps.map(a => ({
        _id: a._id,
        status: a.status,
        appliedAt: a.appliedAt,
        student: a.studentId
    }));

    return res.status(200).json(
        new apiResponse(200, { jobTitle: job.jobTitle, applicants }, "Job applicants retrieved successfully")
    );
})

// Update applicant status (company action)
export const updateApplicantStatus = asyncHandler(async(req,res)=>{
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    if (!['pending','shortlisted','rejected','selected'].includes(status)) {
        throw new apierror(400, 'Invalid status');
    }

    const appDoc = await Application.findOneAndUpdate(
        { _id: applicationId, jobId },
        { status },
        { new: true }
    ).populate({ path: 'studentId', select: 'fullname email branch cgpa phone skills resumeUrl enrollmentNo' });

    if (!appDoc) {
        throw new apierror(404, 'Application not found');
    }

    return res.status(200).json(new apiResponse(200, appDoc, 'Status updated'));
})

// Create job (Company posts job)
// Validates required arrays and fields; status is approved (temp for demo)
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
        status: "approved" // ✅ TEMPORARY: Direct approved for testing (Remove admin approval flow for now)
    });

    return res.status(201).json(
        new apiResponse(201, job, "Job posted successfully")
    );
})

// TEST ROUTE - Create pre-approved job (TEMPORARY - for testing only)
export const createTestJob = asyncHandler(async(req,res)=>{
    const { companyId, companyName, jobTitle, jobDescription, requirements, location, salary, jobType, skills, minCGPA, applicationDeadline } = req.body;

    const job = await Job.create({
        companyId: companyId || "test-company-id",
        companyName: companyName || "Test Company",
        jobTitle: jobTitle || "Software Engineer",
        jobDescription: jobDescription || "Great opportunity for talented developers",
        requirements: requirements || ["Bachelor's degree", "2+ years experience"],
        location: location || "Mumbai",
        salary: salary || "8-12 LPA",
        jobType: jobType || "Full-time",
        skills: skills || ["JavaScript", "React", "Node.js"],
        minCGPA: minCGPA || 7.0,
        applicationDeadline: applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "approved" // ✅ Direct approved for testing
    });

    return res.status(201).json(
        new apiResponse(201, job, "Test job created and approved")
    );
})

// Get pending jobs (for admin)
// Admin view for moderation
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
