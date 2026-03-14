import { Application } from "../models/application.model.js";
import { AptitudeTest } from "../models/aptitudeTest.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { TestAttempt } from "../models/testAttempt.model.js";

const normalizeIds = (ids = []) => ids.map((id) => id.toString());

const deleteJobLinkedData = async (jobIds = []) => {
    const normalizedJobIds = normalizeIds(jobIds);
    if (!normalizedJobIds.length) {
        return {
            jobsDeleted: 0,
            applicationsDeleted: 0,
            testsDeleted: 0,
            attemptsDeleted: 0
        };
    }

    const [applicationResult, testAttemptResult, aptitudeTestResult, jobResult] = await Promise.all([
        Application.deleteMany({ jobId: { $in: normalizedJobIds } }),
        TestAttempt.deleteMany({ jobId: { $in: normalizedJobIds } }),
        AptitudeTest.deleteMany({ jobId: { $in: normalizedJobIds } }),
        Job.deleteMany({ _id: { $in: normalizedJobIds } })
    ]);

    return {
        jobsDeleted: jobResult.deletedCount || 0,
        applicationsDeleted: applicationResult.deletedCount || 0,
        testsDeleted: aptitudeTestResult.deletedCount || 0,
        attemptsDeleted: testAttemptResult.deletedCount || 0
    };
};

export const cleanupCompanyDataByAdminDelete = async (companyId) => {
    const company = await Company.findById(companyId);
    if (!company) {
        return null;
    }

    const jobs = await Job.find({ companyId }).select("_id").lean();
    const jobIds = jobs.map((job) => job._id);

    const jobLinkedResult = await deleteJobLinkedData(jobIds);

    const [companyAttemptResult, companyTestResult, companyDeleteResult] = await Promise.all([
        TestAttempt.deleteMany({ companyId }),
        AptitudeTest.deleteMany({ companyId }),
        Company.deleteOne({ _id: companyId })
    ]);

    return {
        companyDeleted: companyDeleteResult.deletedCount || 0,
        ...jobLinkedResult,
        extraCompanyTestsDeleted: companyTestResult.deletedCount || 0,
        extraCompanyAttemptsDeleted: companyAttemptResult.deletedCount || 0
    };
};

export const cleanupExpiredJobs = async () => {
    const now = new Date();
    const expiredJobs = await Job.find({ applicationDeadline: { $lt: now } }).select("_id").lean();
    const expiredJobIds = expiredJobs.map((job) => job._id);

    return deleteJobLinkedData(expiredJobIds);
};

export const startExpiredJobCleanupScheduler = (intervalMs = 15 * 60 * 1000) => {
    const runCleanup = async () => {
        try {
            const result = await cleanupExpiredJobs();
            if (result.jobsDeleted > 0) {
                console.log("Expired jobs cleanup completed:", result);
            }
        } catch (error) {
            console.error("Expired jobs cleanup failed:", error.message || error);
        }
    };

    runCleanup();
    const timer = setInterval(runCleanup, intervalMs);
    return timer;
};