// Admin controller: manage users, jobs, companies, approvals
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";
import fs from "fs/promises";
import { User } from "../models/user.model.js";
import { StudentMaster } from "../models/studentMaster.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { compareAcademicRecords, normalizeSemesterRecord } from "../utils/academicCompare.js";
import { cleanupCompanyDataByAdminDelete } from "../utils/dataCleanup.js";

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

// Bulk upload/update student master records used for controlled student registration.
// Payload format:
// {
//   records: [
//     { enrollmentNo: "23BEIT30055", phone: "9876543210", email: "optional@college.edu" }
//   ]
// }
const processStudentMasterRecords = async (records = []) => {
    if (!Array.isArray(records) || records.length === 0) {
        throw new apierror(400, "records must be a non-empty array");
    }

    const summary = {
        total: records.length,
        inserted: 0,
        updated: 0,
        invalid: 0,
        details: []
    };

    for (const item of records) {
        const enrollmentNo = String(item?.enrollmentNo || "").trim().toUpperCase();
        const phone = String(item?.phone || "").trim();
        const emailRaw = String(item?.email || "").trim().toLowerCase();

        if (!enrollmentNo || !phone) {
            summary.invalid += 1;
            summary.details.push({
                enrollmentNo: enrollmentNo || null,
                status: "invalid",
                reason: "Missing enrollmentNo or phone"
            });
            continue;
        }

        const existing = await StudentMaster.findOne({ enrollmentNo });

        if (!existing) {
            await StudentMaster.create({
                enrollmentNo,
                phone,
                email: emailRaw || null,
                isActive: true
            });

            summary.inserted += 1;
            summary.details.push({ enrollmentNo, status: "inserted" });
            continue;
        }

        existing.phone = phone;
        existing.email = emailRaw || null;
        existing.isActive = true;
        await existing.save();

        summary.updated += 1;
        summary.details.push({
            enrollmentNo,
            status: "updated",
            isClaimed: existing.isClaimed
        });
    }

    return summary;
};

export const bulkUploadStudentMaster = asyncHandler(async (req, res) => {
    const { records = [] } = req.body;

    const summary = await processStudentMasterRecords(records);

    return res.status(200).json(
        new apiResponse(200, summary, "Student master list upload completed")
    );
});

const parseStudentMasterCsv = (csvText = "") => {
    const cleaned = String(csvText || "").replace(/^\uFEFF/, "").trim();
    if (!cleaned) return [];

    const lines = cleaned.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

    const enrollmentIdx = headers.findIndex((h) => h === "enrollmentno" || h === "enrollment_no");
    const phoneIdx = headers.findIndex((h) => h === "phone" || h === "phone_no" || h === "phoneno");
    const emailIdx = headers.findIndex((h) => h === "email" || h === "emailid");

    if (enrollmentIdx < 0 || phoneIdx < 0) {
        throw new apierror(400, "CSV must contain enrollmentNo and phone columns");
    }

    const records = [];

    for (let i = 1; i < lines.length; i += 1) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        records.push({
            enrollmentNo: cols[enrollmentIdx] || "",
            phone: cols[phoneIdx] || "",
            email: emailIdx >= 0 ? cols[emailIdx] || "" : ""
        });
    }

    return records;
};

export const uploadStudentMasterCsv = asyncHandler(async (req, res) => {
    if (!req.file?.path) {
        throw new apierror(400, "CSV file is required");
    }

    const csvText = await fs.readFile(req.file.path, "utf-8");
    await fs.unlink(req.file.path).catch(() => {});

    const records = parseStudentMasterCsv(csvText);
    if (!records.length) {
        throw new apierror(400, "No valid rows found in CSV");
    }

    const summary = await processStudentMasterRecords(records);
    return res.status(200).json(
        new apiResponse(200, summary, "Student master list upload completed")
    );
});

// Get student academics with student/admin records and mismatch details
export const getStudentAcademicDetails = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findById(studentId).select(
        "fullname email enrollmentNo branch cgpa semesterAcademicRecords adminAcademicRecords academicVerification"
    );

    if (!student) {
        throw new apierror(404, "Student not found");
    }

    return res.status(200).json(
        new apiResponse(200, student, "Student academic details retrieved successfully")
    );
});

// Update official admin academic records for a student
export const updateStudentOfficialAcademics = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { adminAcademicRecords = [] } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!Array.isArray(adminAcademicRecords)) {
        throw new apierror(400, "adminAcademicRecords must be an array");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const normalizedAdmin = adminAcademicRecords
        .map(normalizeSemesterRecord)
        .filter((record) => record.semester >= 1 && record.semester <= 6)
        .sort((a, b) => a.semester - b.semester);

    student.adminAcademicRecords = normalizedAdmin;

    const verification = compareAcademicRecords(student.semesterAcademicRecords || [], student.adminAcademicRecords || []);
    student.academicVerification = {
        hasMismatch: verification.hasMismatch,
        mismatchCount: verification.mismatchCount,
        mismatchSemesters: verification.mismatchSemesters,
        mismatchDetails: verification.mismatchDetails,
        lastComparedAt: verification.comparedAt
    };

    const updatedStudent = await student.save();
    const payload = await User.findById(updatedStudent._id).select(
        "fullname email enrollmentNo semesterAcademicRecords adminAcademicRecords academicVerification"
    );

    return res.status(200).json(
        new apiResponse(200, payload, "Official academic records updated and compared successfully")
    );
});

// List students with academic mismatches for quick admin review
export const getAcademicMismatchStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
        "academicVerification.hasMismatch": true
    };

    if (search) {
        filter.$or = [
            { fullname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { enrollmentNo: { $regex: search, $options: "i" } }
        ];
    }

    const students = await User.find(filter)
        .select("fullname email enrollmentNo branch cgpa academicVerification")
        .sort({ "academicVerification.mismatchCount": -1, updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const totalCount = await User.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(200, { students, totalCount, page: Number(page), limit: Number(limit) }, "Mismatch students retrieved successfully")
    );
});

// Get student master records for admin verification
export const getStudentMasterRecords = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = "" } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
        filter.$or = [
            { enrollmentNo: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const records = await StudentMaster.find(filter)
        .select("enrollmentNo phone email isActive isClaimed claimedBy claimedAt updatedAt")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const totalCount = await StudentMaster.countDocuments(filter);

    return res.status(200).json(
        new apiResponse(
            200,
            { records, totalCount, page: pageNum, limit: limitNum },
            "Student master records retrieved successfully"
        )
    );
});

// Sync pending student master records with already registered users.
// Useful for backfilling records created before claim tracking was introduced.
export const syncStudentMasterClaims = asyncHandler(async (req, res) => {
    const pendingRecords = await StudentMaster.find({ isActive: true, isClaimed: false })
        .select("_id enrollmentNo");

    if (!pendingRecords.length) {
        return res.status(200).json(
            new apiResponse(200, {
                totalPending: 0,
                matchedUsers: 0,
                updated: 0
            }, "No pending student master records to sync")
        );
    }

    const enrollmentNos = pendingRecords
        .map((record) => String(record.enrollmentNo || "").trim().toUpperCase())
        .filter(Boolean);

    const users = await User.find({ enrollmentNo: { $in: enrollmentNos } })
        .select("_id enrollmentNo");

    const userByEnrollment = new Map(
        users.map((user) => [String(user.enrollmentNo || "").trim().toUpperCase(), user])
    );

    const now = new Date();
    const updates = [];

    for (const record of pendingRecords) {
        const normalizedEnrollment = String(record.enrollmentNo || "").trim().toUpperCase();
        const matchedUser = userByEnrollment.get(normalizedEnrollment);

        if (!matchedUser) {
            continue;
        }

        updates.push({
            updateOne: {
                filter: { _id: record._id },
                update: {
                    $set: {
                        isClaimed: true,
                        claimedBy: matchedUser._id,
                        claimedAt: now
                    }
                }
            }
        });
    }

    if (updates.length) {
        await StudentMaster.bulkWrite(updates);
    }

    return res.status(200).json(
        new apiResponse(
            200,
            {
                totalPending: pendingRecords.length,
                matchedUsers: updates.length,
                updated: updates.length
            },
            "Student master claims synced successfully"
        )
    );
});

// Delete a student master record by ID
export const deleteStudentMasterRecord = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const record = await StudentMaster.findById(recordId);
    if (!record) throw new apierror(404, "Student master record not found");
    await StudentMaster.deleteOne({ _id: recordId });
    return res.status(200).json(new apiResponse(200, null, "Student master record deleted successfully"));
});

// Bulk upload official academic records using enrollmentNo mapping
// Payload format:
// {
//   records: [
//     {
//       enrollmentNo: "23BEIT30055",
//       semesters: [{ semester, spi, cpi, backlogCount, backlogSubjects: [] }]
//     }
//   ]
// }
export const bulkUploadOfficialAcademics = asyncHandler(async (req, res) => {
    const { records = [] } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
        throw new apierror(400, "records must be a non-empty array");
    }

    const summary = {
        total: records.length,
        updated: 0,
        notFound: 0,
        invalid: 0,
        mismatchedAfterCompare: 0,
        details: []
    };

    for (const item of records) {
        const enrollmentNo = String(item?.enrollmentNo || "").trim().toUpperCase();
        const semesters = Array.isArray(item?.semesters) ? item.semesters : [];

        if (!enrollmentNo || semesters.length === 0) {
            summary.invalid += 1;
            summary.details.push({ enrollmentNo: enrollmentNo || null, status: "invalid", reason: "Missing enrollmentNo or semesters" });
            continue;
        }

        const student = await User.findOne({ enrollmentNo });
        if (!student) {
            summary.notFound += 1;
            summary.details.push({ enrollmentNo, status: "not-found" });
            continue;
        }

        const normalizedAdmin = semesters
            .map(normalizeSemesterRecord)
            .filter((record) => record.semester >= 1 && record.semester <= 6)
            .sort((a, b) => a.semester - b.semester);

        student.adminAcademicRecords = normalizedAdmin;

        const verification = compareAcademicRecords(student.semesterAcademicRecords || [], student.adminAcademicRecords || []);
        student.academicVerification = {
            hasMismatch: verification.hasMismatch,
            mismatchCount: verification.mismatchCount,
            mismatchSemesters: verification.mismatchSemesters,
            mismatchDetails: verification.mismatchDetails,
            lastComparedAt: verification.comparedAt
        };

        await student.save();

        summary.updated += 1;
        if (verification.hasMismatch) {
            summary.mismatchedAfterCompare += 1;
        }

        summary.details.push({
            enrollmentNo,
            studentId: student._id,
            status: "updated",
            hasMismatch: verification.hasMismatch,
            mismatchCount: verification.mismatchCount
        });
    }

    return res.status(200).json(
        new apiResponse(200, summary, "Bulk official academic upload completed")
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

    // Keep student master registry in sync so deleted student can re-register.
    if (student?.enrollmentNo) {
        await StudentMaster.findOneAndUpdate(
            { enrollmentNo: String(student.enrollmentNo).trim().toUpperCase() },
            {
                isClaimed: false,
                claimedBy: null,
                claimedAt: null,
                registrationOtp: null,
                registrationOtpExpiry: null,
                registrationOtpVerifiedAt: null,
                registrationOtpAttempts: 0
            }
        );
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

    const cleanupResult = await cleanupCompanyDataByAdminDelete(companyId);
    if (!cleanupResult) {
        throw new apierror(404, "Company not found");
    }

    return res.status(200).json(
        new apiResponse(200, cleanupResult, "Company and associated data deleted successfully")
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
