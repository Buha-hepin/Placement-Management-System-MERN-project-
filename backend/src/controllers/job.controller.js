// Job controller: student browse/apply, company/admin manage jobs
// Note: Uses Application model for per-student application status
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { sendNotificationEmail } from "../utils/emailSender.js";

const buildStatusUpdateMessage = (name, status, jobTitle) => {
    const safeName = name || "Student";
    const safeJob = jobTitle || "your application";
    const safeStatus = status || "updated";
    return `Dear ${safeName}, your application for ${safeJob} has been updated to '${safeStatus}'.`;
};

const sendStatusUpdateEmail = async ({ to, name, status, jobTitle }) => {
    if (!to) return { skipped: true };

    const message = buildStatusUpdateMessage(name, status, jobTitle);
    const subject = "Placement Management System - Application Status Updated";
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h3 style="color: #1e40af;">Application Status Update</h3>
            <p>${message}</p>
            <p style="color: #6b7280; font-size: 12px;">This is an automated message.</p>
        </div>
    `;

    return sendNotificationEmail(to, subject, html, message);
};

const sendJobModerationEmail = async ({ to, companyName, jobTitle, decision, rejectionReason }) => {
    if (!to) return { skipped: true };

    const safeCompanyName = companyName || "Company";
    const safeJobTitle = jobTitle || "your job post";
    const isApproved = decision === "approved";
    const subject = `Job ${isApproved ? "Approved" : "Rejected"}: ${safeJobTitle}`;
    const reasonLine = !isApproved && rejectionReason
        ? `<p><strong>Reason:</strong> ${rejectionReason}</p>`
        : "";

    const text = isApproved
        ? `Dear ${safeCompanyName}, your job '${safeJobTitle}' has been approved and is now visible to students.`
        : `Dear ${safeCompanyName}, your job '${safeJobTitle}' has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`;

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h3 style="color: #1e40af;">Job Moderation Update</h3>
            <p>Dear ${safeCompanyName},</p>
            <p>Your job post <strong>${safeJobTitle}</strong> has been <strong>${decision}</strong>.</p>
            ${reasonLine}
            <p style="color: #6b7280; font-size: 12px;">This is an automated message.</p>
        </div>
    `;

    return sendNotificationEmail(to, subject, html, text);
};

const hasStudentId = (arr = [], studentId = "") => arr.some((id) => String(id) === String(studentId));

const resolveStudentId = (req, providedId = "") => {
    const authStudentId = String(req.user?.id || "");
    const fallbackStudentId = String(
        providedId || req.params?.studentId || req.body?.studentId || req.query?.studentId || ""
    );

    const resolvedStudentId = authStudentId || fallbackStudentId;
    if (!resolvedStudentId) {
        throw new apierror(400, "Student ID is required");
    }

    return resolvedStudentId;
};

const resolveCompanyId = (req, providedId = "") => {
    const authCompanyId = String(req.user?.id || "");
    const fallbackCompanyId = String(
        providedId || req.params?.companyId || req.body?.companyId || req.query?.companyId || ""
    );

    const resolvedCompanyId = authCompanyId || fallbackCompanyId;
    if (!resolvedCompanyId) {
        throw new apierror(400, "Company ID is required");
    }

    return resolvedCompanyId;
};

const parseAndValidateDeadline = (value) => {
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

const evaluateJobEligibility = (student, job) => {
    const reasons = [];

    if (!student) {
        reasons.push("Student profile was not found.");
        return { isEligible: false, reasons };
    }

    if (student.isPlacementBlocked) {
        reasons.push("You are blocked from placement activity due to repeated no-shows.");
    }

    const requiredCgpa = Number(job?.minCGPA || 0);
    const studentCgpa = Number(student?.cgpa);
    const hasValidCgpa = Number.isFinite(studentCgpa);

    if (requiredCgpa > 0 && !hasValidCgpa) {
        reasons.push(`Your profile does not have CGPA updated. Minimum required CGPA is ${requiredCgpa}.`);
    }

    if (requiredCgpa > 0 && hasValidCgpa && studentCgpa < requiredCgpa) {
        reasons.push(`Your CGPA ${studentCgpa} is below the minimum required CGPA ${requiredCgpa}.`);
    }

    return {
        isEligible: reasons.length === 0,
        reasons
    };
};

const sendIneligibilityEmail = async ({ to, name, jobTitle, companyName, reasons = [] }) => {
    if (!to || reasons.length === 0) return { skipped: true };

    const safeName = name || "Student";
    const safeJobTitle = jobTitle || "this job";
    const safeCompanyName = companyName || "the company";
    const reasonItems = reasons.map((reason) => `<li>${reason}</li>`).join("");
    const text = `Dear ${safeName}, you are not eligible for ${safeJobTitle} at ${safeCompanyName}. Reasons: ${reasons.join(" ")}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h3 style="color: #b91c1c;">Not Eligible For Job Application</h3>
            <p>Dear ${safeName},</p>
            <p>You are currently not eligible for <strong>${safeJobTitle}</strong> at <strong>${safeCompanyName}</strong>.</p>
            <p><strong>Reason${reasons.length > 1 ? "s" : ""}:</strong></p>
            <ul>${reasonItems}</ul>
            <p style="color: #6b7280; font-size: 12px;">Please update your student profile if the above information is incomplete or incorrect.</p>
        </div>
    `;

    return sendNotificationEmail(to, `Not Eligible: ${safeJobTitle}`, html, text);
};

const applyNoShowPenalty = async (studentId) => {
    const student = await User.findById(studentId);
    if (!student) return null;

    student.noShowCount = Number(student.noShowCount || 0) + 1;
    if (student.noShowCount >= 3) {
        student.isPlacementBlocked = true;
        if (!student.placementBlockedAt) {
            student.placementBlockedAt = new Date();
        }
    }

    await student.save();
    return {
        noShowCount: student.noShowCount,
        isPlacementBlocked: student.isPlacementBlocked
    };
};

const attachInterestMeta = (job, studentId = "", student = null) => {
    const doc = typeof job.toObject === "function" ? job.toObject() : job;
    const interestedCount = (doc.interestedStudents || []).length;
    const notInterestedCount = (doc.notInterestedStudents || []).length;
    const interestStatus = studentId
        ? hasStudentId(doc.interestedStudents || [], studentId)
            ? "interested"
            : hasStudentId(doc.notInterestedStudents || [], studentId)
                ? "not-interested"
                : "none"
        : "none";

    const eligibility = student ? evaluateJobEligibility(student, doc) : { isEligible: true, reasons: [] };

    return {
        ...doc,
        interestedCount,
        notInterestedCount,
        interestStatus,
        isEligible: eligibility.isEligible,
        eligibilityReasons: eligibility.reasons
    };
};

// Get all approved jobs for students
// Query supports pagination + filters (search/location/jobType)
export const getAllApprovedJobs = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, search = "", location = "", jobType = "", studentId = "" } = req.query;

    let filter = { status: "approved" };
    const now = new Date();
    filter.applicationDeadline = { $gte: now };

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

    let student = null;
    if (studentId) {
        student = await User.findById(studentId).select('cgpa isPlacementBlocked').lean();
    }

    const jobsWithMeta = jobs.map((job) => attachInterestMeta(job, studentId, student));

    return res.status(200).json(
        new apiResponse(200, {
            jobs: jobsWithMeta,
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
    const { studentId = "" } = req.query;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findById(jobId).populate("companyId", "email location");
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    const student = studentId
        ? await User.findById(studentId).select('cgpa isPlacementBlocked').lean()
        : null;

    return res.status(200).json(
        new apiResponse(200, attachInterestMeta(job, studentId, student), "Job details retrieved successfully")
    );
})

// Apply for a job (student applies)
// Creates an Application doc; also keeps quick applicants list on Job
export const applyForJob = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    const studentId = resolveStudentId(req, req.body?.studentId);

    if (!jobId || !studentId) {
        throw new apierror(400, "Job ID and Student ID are required");
    }

    const student = await User.findById(studentId).select('fullname email cgpa isPlacementBlocked noShowCount');
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    const eligibility = evaluateJobEligibility(student, job);
    if (!eligibility.isEligible) {
        try {
            await sendIneligibilityEmail({
                to: student.email,
                name: student.fullname,
                jobTitle: job.jobTitle,
                companyName: job.companyName,
                reasons: eligibility.reasons
            });
        } catch (err) {
            console.error('Auto ineligibility email failed:', err.message);
        }

        throw new apierror(403, `You are not eligible for this job. ${eligibility.reasons.join(' ')}`.trim());
    }

    const isNotInterested = hasStudentId(job.notInterestedStudents || [], studentId);
    if (isNotInterested) {
        throw new apierror(403, "You marked this job as not interested. Change to interested to apply.");
    }

    const isInterested = hasStudentId(job.interestedStudents || [], studentId);
    if (!isInterested) {
        throw new apierror(400, "Please mark the job as interested before applying.");
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        throw new apierror(400, "Application deadline has passed");
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

// Mark student interest state for a job.
export const setJobInterest = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { interest } = req.body;
    const studentId = resolveStudentId(req, req.body?.studentId);

    if (!jobId || !studentId || !interest) {
        throw new apierror(400, "Job ID, student ID and interest are required");
    }

    if (!["interested", "not-interested"].includes(interest)) {
        throw new apierror(400, "interest must be 'interested' or 'not-interested'");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    const student = await User.findById(studentId).select('fullname email cgpa isPlacementBlocked');
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const eligibility = evaluateJobEligibility(student, job);
    if (!eligibility.isEligible) {
        try {
            await sendIneligibilityEmail({
                to: student.email,
                name: student.fullname,
                jobTitle: job.jobTitle,
                companyName: job.companyName,
                reasons: eligibility.reasons
            });
        } catch (err) {
            console.error('Auto ineligibility email failed:', err.message);
        }

        throw new apierror(403, `You are not eligible for this job. ${eligibility.reasons.join(' ')}`.trim());
    }

    const alreadyInterested = hasStudentId(job.interestedStudents || [], studentId);
    const alreadyNotInterested = hasStudentId(job.notInterestedStudents || [], studentId);
    if (alreadyInterested || alreadyNotInterested) {
        throw new apierror(409, "Interest choice is locked. You can choose only once.");
    }

    if (interest === "interested") {
        job.interestedStudents.push(studentId);
    } else {
        job.notInterestedStudents.push(studentId);
    }
    await job.save();

    const responseData = {
        jobId: job._id,
        interestStatus: interest,
        interestedCount: (job.interestedStudents || []).length,
        notInterestedCount: (job.notInterestedStudents || []).length
    };

    const msg = interest === "interested"
        ? "Marked as interested. You can apply now."
        : "Marked as not interested.";

    return res.status(200).json(new apiResponse(200, responseData, msg));
});

// Get jobs applied by student
// Joins Application with Job; flattens to job fields + application status
export const getStudentApplications = asyncHandler(async(req,res)=>{
    const studentId = resolveStudentId(req, req.params?.studentId);

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

// Withdraw application (student action)
export const withdrawApplication = asyncHandler(async (req, res) => {
    const studentId = resolveStudentId(req, req.params?.studentId);
    const { applicationId } = req.params;

    if (!studentId || !applicationId) {
        throw new apierror(400, "Student ID and Application ID are required");
    }

    const appDoc = await Application.findOne({ _id: applicationId, studentId });
    if (!appDoc) {
        throw new apierror(404, "Application not found");
    }

    if (appDoc.status === 'selected') {
        throw new apierror(400, "Cannot withdraw a selected application");
    }

    await Application.deleteOne({ _id: applicationId });

    if (appDoc.jobId) {
        await Job.findByIdAndUpdate(appDoc.jobId, { $pull: { applicants: studentId } });
    }

    return res.status(200).json(
        new apiResponse(200, {}, "Application withdrawn successfully")
    );
});

// Get applicants for a specific job (Company views applicants)
export const getJobApplicants = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    const {
        search = "",
        status = "",
        branch = "",
        minCgpa = "",
        skills = "",
        sortBy = "appliedAt",
        sortOrder = "desc",
        page = 1,
        limit = 20
    } = req.query;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findById(jobId).select('jobTitle');
    if (!job) {
        throw new apierror(404, "Job not found");
    }

    // Base query with optional status filter
    const baseQuery = { jobId };
    if (status) {
        baseQuery.status = status;
    }

    let apps = await Application.find(baseQuery)
        .sort({ createdAt: -1 })
        .populate({ path: 'studentId', select: 'fullname email branch cgpa phone skills resumeUrl enrollmentNo' });

    // Transform for easier filtering/sorting
    let applicants = apps.map(a => ({
        _id: a._id,
        status: a.status,
        appliedAt: a.appliedAt,
        student: a.studentId
    }));

    // Server-side filtering (fast win without aggregation)
    if (search) {
        const q = search.toLowerCase();
        applicants = applicants.filter(({ student }) => {
            const s = student || {};
            return (
                (s.fullname || '').toLowerCase().includes(q) ||
                (s.email || '').toLowerCase().includes(q) ||
                (s.enrollmentNo || '').toLowerCase().includes(q) ||
                (s.branch || '').toLowerCase().includes(q)
            );
        });
    }

    if (branch) {
        const b = branch.toLowerCase();
        applicants = applicants.filter(({ student }) => ((student?.branch || '').toLowerCase() === b));
    }

    if (minCgpa) {
        const min = Number(minCgpa);
        if (!Number.isNaN(min)) {
            applicants = applicants.filter(({ student }) => Number(student?.cgpa || 0) >= min);
        }
    }

    if (skills) {
        const list = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (list.length) {
            applicants = applicants.filter(({ student }) => {
                const userSkills = (student?.skills || []).map(x => String(x).toLowerCase());
                return list.every(tag => userSkills.includes(tag));
            });
        }
    }

    // Sorting
    const dir = sortOrder === 'asc' ? 1 : -1;
    applicants.sort((a, b) => {
        const getVal = (x) => {
            switch (sortBy) {
                case 'cgpa':
                    return Number(x.student?.cgpa || 0);
                case 'fullname':
                    return (x.student?.fullname || '').toLowerCase();
                case 'status':
                    return (x.status || '').toLowerCase();
                case 'appliedAt':
                default:
                    return new Date(x.appliedAt || 0).getTime();
            }
        };
        const va = getVal(a);
        const vb = getVal(b);
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
    });

    // Pagination
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 20;
    const total = applicants.length;
    const start = (p - 1) * l;
    const paged = applicants.slice(start, start + l);

    return res.status(200).json(
        new apiResponse(200, {
            jobTitle: job.jobTitle,
            applicants: paged,
            total,
            page: p,
            totalPages: Math.ceil(total / l)
        }, "Job applicants retrieved successfully")
    );
})

// Update applicant status (company action)
export const updateApplicantStatus = asyncHandler(async(req,res)=>{
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    if (!['pending','shortlisted','rejected','selected','no-show'].includes(status)) {
        throw new apierror(400, 'Invalid status');
    }

    const appDoc = await Application.findOne({ _id: applicationId, jobId })
        .populate({ path: 'studentId', select: 'fullname email branch cgpa phone skills resumeUrl enrollmentNo' })
        .populate({ path: 'jobId', select: 'jobTitle companyName' });

    if (!appDoc) {
        throw new apierror(404, 'Application not found');
    }

    const previousStatus = appDoc.status;
    appDoc.status = status;
    await appDoc.save();

    let noShowPenalty = null;
    if (status === 'no-show' && previousStatus !== 'no-show' && appDoc.studentId?._id) {
        noShowPenalty = await applyNoShowPenalty(appDoc.studentId._id);
    }

    let emailResult = null;
    try {
        emailResult = await sendStatusUpdateEmail({
            to: appDoc.studentId?.email,
            name: appDoc.studentId?.fullname,
            status,
            jobTitle: appDoc.jobId?.jobTitle
        });
    } catch (err) {
        console.error('Auto status email failed:', err.message);
        emailResult = { error: err.message };
    }

    return res.status(200).json(new apiResponse(200, { appDoc, emailResult, noShowPenalty }, 'Status updated'));
})

// Create job (Company posts job)
// Validates required arrays and fields; jobs are pending for admin approval
export const createJob = asyncHandler(async(req,res)=>{
    const authCompanyId = resolveCompanyId(req, req.body?.companyId);
    const { companyName, jobTitle, jobDescription, requirements, location, salary, jobType, skills, minCGPA, applicationDeadline, status } = req.body;

    if (![jobTitle, jobDescription, companyName, location, applicationDeadline].every(field => field?.toString().trim().length > 0)) {
        throw new apierror(400, "All required fields must be filled");
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
        throw new apierror(400, "Requirements must be a non-empty array");
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        throw new apierror(400, "Skills must be a non-empty array");
    }

    const normalizedDeadline = parseAndValidateDeadline(applicationDeadline);

    const company = await Company.findById(authCompanyId).select('companyName').lean();
    if (!company) {
        throw new apierror(404, 'Company not found');
    }

    const job = await Job.create({
        companyId: authCompanyId,
        companyName: company.companyName || companyName,
        jobTitle,
        jobDescription,
        requirements,
        location,
        salary,
        jobType,
        skills,
        minCGPA,
        applicationDeadline: normalizedDeadline,
        status: "pending"
    });

    return res.status(201).json(
        new apiResponse(201, job, "Job posted successfully")
    );
})

// Job analytics: counts and top skills/branches
export const getJobAnalytics = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    if (!jobId) throw new apierror(400, "Job ID is required");

    const apps = await Application.find({ jobId })
        .populate({ path: 'studentId', select: 'branch skills' });

    const total = apps.length;
    const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
    const selected = apps.filter(a => a.status === 'selected').length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    const noShow = apps.filter(a => a.status === 'no-show').length;

    const branchCounts = {};
    const skillCounts = {};
    apps.forEach(a => {
        const b = (a.studentId?.branch || '').trim();
        if (b) branchCounts[b] = (branchCounts[b] || 0) + 1;
        const sk = (a.studentId?.skills || []).map(s => String(s).trim()).filter(Boolean);
        sk.forEach(tag => { skillCounts[tag] = (skillCounts[tag] || 0) + 1; });
    });

    // Top 5 skills/branches
    const topBranches = Object.entries(branchCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({ name, count }));
    const topSkills = Object.entries(skillCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({ name, count }));

    return res.status(200).json(new apiResponse(200, {
        total, shortlisted, selected, rejected, noShow,
        shortlistRatio: total ? (shortlisted/total) : 0,
        topBranches,
        topSkills
    }, 'Job analytics'));
});

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
    ).populate("companyId", "email companyName");

    if (!job) {
        throw new apierror(404, "Job not found");
    }

    let emailResult = null;
    try {
        emailResult = await sendJobModerationEmail({
            to: job.companyId?.email,
            companyName: job.companyId?.companyName || job.companyName,
            jobTitle: job.jobTitle,
            decision: "approved"
        });
    } catch (err) {
        console.error("Approve notification email failed:", err.message);
        emailResult = { error: err.message };
    }

    return res.status(200).json(
        new apiResponse(200, { job, emailResult }, "Job approved successfully")
    );
})

// Reject job (Admin)
export const rejectJob = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    const { rejectionReason = "" } = req.body || {};

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const job = await Job.findByIdAndUpdate(
        jobId,
        { status: "rejected", rejectionReason: rejectionReason || null },
        { new: true }
    ).populate("companyId", "email companyName");

    if (!job) {
        throw new apierror(404, "Job not found");
    }

    let emailResult = null;
    try {
        emailResult = await sendJobModerationEmail({
            to: job.companyId?.email,
            companyName: job.companyId?.companyName || job.companyName,
            jobTitle: job.jobTitle,
            decision: "rejected",
            rejectionReason
        });
    } catch (err) {
        console.error("Reject notification email failed:", err.message);
        emailResult = { error: err.message };
    }

    return res.status(200).json(
        new apiResponse(200, { job, emailResult }, "Job rejected successfully")
    );
})

// Bulk update applicant status for a job
export const updateApplicantsBulkStatus = asyncHandler(async(req,res)=>{
    const { jobId } = req.params;
    const { applicationIds = [], status } = req.body;

    if (!jobId) throw new apierror(400, 'Job ID is required');
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        throw new apierror(400, 'applicationIds must be a non-empty array');
    }
    if (!['pending','shortlisted','rejected','selected','no-show'].includes(status)) {
        throw new apierror(400, 'Invalid status');
    }

    const updatedApps = await Application.find({ _id: { $in: applicationIds }, jobId })
        .populate({ path: 'studentId', select: 'fullname email' })
        .populate({ path: 'jobId', select: 'jobTitle companyName' });

    const previousStatusById = new Map(updatedApps.map((a) => [String(a._id), a.status]));

    await Promise.all(updatedApps.map(async (app) => {
        app.status = status;
        await app.save();
    }));

    let noShowBlocked = 0;
    if (status === 'no-show') {
        for (const app of updatedApps) {
            const prev = previousStatusById.get(String(app._id));
            if (prev !== 'no-show' && app.studentId?._id) {
                const penalty = await applyNoShowPenalty(app.studentId._id);
                if (penalty?.isPlacementBlocked) {
                    noShowBlocked += 1;
                }
            }
        }
    }

    let emailSummary = null;
    try {
        const settled = await Promise.allSettled(
            updatedApps.map((app) =>
                sendStatusUpdateEmail({
                    to: app.studentId?.email,
                    name: app.studentId?.fullname,
                    status,
                    jobTitle: app.jobId?.jobTitle
                })
            )
        );

        const sent = settled.filter((r) => r.status === 'fulfilled').length;
        const failed = settled.length - sent;
        emailSummary = { recipients: updatedApps.length, sent, failed };
    } catch (err) {
        console.error('Bulk status auto email failed:', err.message);
        emailSummary = { error: err.message };
    }

    return res.status(200).json(new apiResponse(200, {
        acknowledged: true,
        matchedCount: updatedApps.length,
        modifiedCount: updatedApps.length,
        status,
        noShowBlocked,
        emailSummary
    }, 'Bulk status updated'));
})

// Delete job (company action)
export const deleteJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        throw new apierror(400, "Job ID is required");
    }

    const result = await Job.deleteOne({ _id: jobId });
    await Application.deleteMany({ jobId });

    if (result.deletedCount === 0) {
        return res.status(200).json(
            new apiResponse(200, {}, "Job already removed")
        );
    }

    return res.status(200).json(
        new apiResponse(200, {}, "Job deleted successfully")
    );
});
