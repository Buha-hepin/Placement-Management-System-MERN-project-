// Company controller: company profile and company job management
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { apiResponse } from "../utils/apiResponse.js";

// Get company details by ID
export const fetchCompanyDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
    const { id } = req.params;
    const { companyName, email, location, website, description } = req.body;

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
    if (website) company.website = website;
    if (description) company.description = description;

    const updatedCompany = await company.save();
    const companyData = await Company.findById(updatedCompany._id).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, companyData, "Company details updated successfully")
    );
});

// Post a new job
// Maps request fields to Job schema; includes companyName from DB
export const postJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, location, salary, requirements, skillsRequired, jobType } = req.body;

    if (!id) {
        throw new apierror(400, "Company ID is required");
    }

    if (![title, description, location].every(field => typeof field === 'string' && field.trim().length > 0)) {
        throw new apierror(400, "Title, description, and location are required");
    }

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
        // Keep pending by default to allow admin flow, adjust as needed
        status: "approved"
    });

    return res.status(201).json(
        new apiResponse(201, job, "Job posted successfully")
    );
});

// Fetch all jobs posted by a company
// Returns jobs by companyId for dashboard, newest first
export const fetchJobsByCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
