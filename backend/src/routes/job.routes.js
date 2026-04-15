import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
// Job routes: student browse/apply, company applicants, admin moderation
import { 
    getAllApprovedJobs, 
    getJobDetails, 
    applyForJob,
    setJobInterest,
    getStudentApplications,
    withdrawApplication,
    getJobApplicants,
    updateApplicantStatus,
    updateApplicantsBulkStatus,
    deleteJob,
    createJob,
    getPendingJobs,
    approveJob,
    rejectJob,
    getJobAnalytics
} from '../controllers/job.controller.js';

const router = Router();

// Specific routes FIRST (before :jobId)
router.route('/browse').get(getAllApprovedJobs);
router.route('/student/:studentId/applications').get(getStudentApplications);
router.route('/student/:studentId/applications/:applicationId').delete(withdrawApplication);
router.route('/admin/pending').get(requireAuth, requireAdmin, getPendingJobs);
router.route('/admin/:jobId/approve').put(requireAuth, requireAdmin, approveJob);
router.route('/admin/:jobId/reject').put(requireAuth, requireAdmin, rejectJob);
router.route('/create').post(createJob);
router.route('/:jobId/analytics').get(getJobAnalytics);

// Generic routes LAST
router.route('/:jobId').get(getJobDetails);
router.route('/:jobId').delete(deleteJob);
router.route('/:jobId/delete').post(deleteJob);
router.route('/:jobId/apply').post(applyForJob);
router.route('/:jobId/interest').post(setJobInterest);
router.route('/:jobId/applicants').get(getJobApplicants);
router.route('/:jobId/applicants/:applicationId/status').put(updateApplicantStatus);
router.route('/:jobId/applicants/bulk-status').put(updateApplicantsBulkStatus);

export default router;
