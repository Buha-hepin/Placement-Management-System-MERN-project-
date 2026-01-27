import { Router } from 'express';
// Job routes: student browse/apply, company applicants, admin moderation
import { 
    getAllApprovedJobs, 
    getJobDetails, 
    applyForJob,
    getStudentApplications,
    getJobApplicants,
    updateApplicantStatus,
    updateApplicantsBulkStatus,
    createJob,
    createTestJob,
    getPendingJobs,
    approveJob,
    rejectJob,
    getJobAnalytics,
    notifyApplicant
} from '../controllers/job.controller.js';

const router = Router();

// Specific routes FIRST (before :jobId)
router.route('/browse').get(getAllApprovedJobs);
router.route('/student/:studentId/applications').get(getStudentApplications);
router.route('/admin/pending').get(getPendingJobs);
router.route('/admin/:jobId/approve').put(approveJob);
router.route('/admin/:jobId/reject').put(rejectJob);
router.route('/create').post(createJob);
router.route('/:jobId/analytics').get(getJobAnalytics);

// TEST ROUTE - Remove in production
router.route('/test/create').post(createTestJob);

// Generic routes LAST
router.route('/:jobId').get(getJobDetails);
router.route('/:jobId/apply').post(applyForJob);
router.route('/:jobId/applicants').get(getJobApplicants);
router.route('/:jobId/applicants/:applicationId/status').put(updateApplicantStatus);
router.route('/:jobId/applicants/bulk-status').put(updateApplicantsBulkStatus);
router.route('/:jobId/applicants/:applicationId/notify').post(notifyApplicant);

export default router;
