// Company controller: company profile and company job management
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { apiResponse } from "../utils/apiResponse.js";

const parseAndValidateDeadline = (value) => {
    if (!value) {
        throw new apierror(400, "Application deadline is required");
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new apierror(400, "Invalid application deadline");
    }

    // Date-only input from UI should remain valid for the full selected day.
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        parsed.setHours(23, 59, 59, 999);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (parsed < todayStart) {
        throw new apierror(400, "Application deadline cannot be in the past");
    }

    return parsed;
};

const resolveCompanyId = (req) => {
    const authCompanyId = String(req.user?.id || "");
    const paramCompanyId = String(req.params?.id || "");
    const bodyCompanyId = String(req.body?.companyId || "");
    const queryCompanyId = String(req.query?.companyId || "");

    const resolvedCompanyId = authCompanyId || paramCompanyId || bodyCompanyId || queryCompanyId;
    if (!resolvedCompanyId) {
        throw new apierror(400, "Company ID is required");
    }

    return resolvedCompanyId;
};

// Get company details by ID
export const fetchCompanyDetails = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);

    if (!id) {
        throw new apierror(400, "Company ID is required");
    }

    const company = await Company.findById(id).select("-password -refreshToken");
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    return res.status(200).json(
        new apiResponse(200, company, "Company details retrieved successfully")
    );
});

// Edit company details
export const editCompanyDetails = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);
    const { companyName, email, location, about, description } = req.body;

    if (!id) {
        throw new apierror(400, "Company ID is required");
    }

    const company = await Company.findById(id);
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    // Update only provided fields
    if (companyName) company.companyName = companyName;
    if (email) company.email = email;
    if (location) company.location = location;
    if (typeof about === "string") company.about = about;
    if (typeof description === "string") company.about = description;

    const updatedCompany = await company.save();
    const companyData = await Company.findById(updatedCompany._id).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, companyData, "Company details updated successfully")
    );
});

// Post a new job
// Maps request fields to Job schema; includes companyName from DB
export const postJob = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);
    const { title, description, location, salary, requirements, skillsRequired, jobType, applicationDeadline } = req.body;

    if (!id) {
        throw new apierror(400, "Company ID is required");
    }

    if (![title, description, location].every(field => typeof field === 'string' && field.trim().length > 0)) {
        throw new apierror(400, "Title, description, and location are required");
    }

    const normalizedDeadline = parseAndValidateDeadline(applicationDeadline);

    const company = await Company.findById(id);
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    // Map fields to Job model schema
    const job = await Job.create({
        companyId: id,
        companyName: company.companyName,
        jobTitle: title,
        jobDescription: description,
        requirements: Array.isArray(requirements) ? requirements : [],
        location,
        salary,
        jobType,
        skills: Array.isArray(skillsRequired) ? skillsRequired : [],
        applicationDeadline: normalizedDeadline,
        // Keep pending by default to allow admin flow, adjust as needed
        status: "pending"
    });

    return res.status(201).json(
        new apiResponse(201, job, "Job posted successfully")
    );
});

// Fetch all jobs posted by a company
// Returns jobs by companyId for dashboard, newest first
export const fetchJobsByCompany = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);

    if (!id) {
        throw new apierror(400, "Company ID is required");
    }

    const company = await Company.findById(id);
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    // Use correct field from Job model
    const jobs = await Job.find({ companyId: id }).sort({ postedAt: -1 });

    return res.status(200).json(
        new apiResponse(200, jobs, "Jobs retrieved successfully")
    );
});

// Edit a job posted by a company
export const editCompanyJob = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);
    const { jobId } = req.params;
    const { jobTitle, jobDescription, location, salary, jobType, skills, requirements, applicationDeadline } = req.body;

    if (!id || !jobId) {
        throw new apierror(400, "Company ID and Job ID are required");
    }

    const job = await Job.findOne({ _id: jobId, companyId: id });
    if (!job) {
        throw new apierror(404, "Job not found for this company");
    }

    // Update only provided fields
    if (jobTitle) job.jobTitle = jobTitle;
    if (jobDescription) job.jobDescription = jobDescription;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (jobType) job.jobType = jobType;
    if (skills) job.skills = Array.isArray(skills) ? skills : [];
    if (requirements) job.requirements = Array.isArray(requirements) ? requirements : [];
    if (applicationDeadline) {
        job.applicationDeadline = parseAndValidateDeadline(applicationDeadline);
    }

    const updatedJob = await job.save();

    return res.status(200).json(
        new apiResponse(200, updatedJob, "Job updated successfully")
    );
});

// Delete a job posted by a company
export const deleteCompanyJob = asyncHandler(async (req, res) => {
    const id = resolveCompanyId(req);
    const { jobId } = req.params;

    if (!id || !jobId) {
        throw new apierror(400, "Company ID and Job ID are required");
    }

    const job = await Job.findOne({ _id: jobId, companyId: id });
    if (!job) {
        throw new apierror(404, "Job not found for this company");
    }

    await Job.deleteOne({ _id: jobId, companyId: id });
    await Application.deleteMany({ jobId });

    return res.status(200).json(
        new apiResponse(200, {}, "Job deleted successfully")
    );
});
