import { Router } from 'express';
// Job routes: student browse/apply, company applicants, admin moderation
import { 
    getAllApprovedJobs, 
    getJobDetails, 
    applyForJob,
    getStudentApplications,
    getJobApplicants,
    updateApplicantStatus,
    createJob,
    createTestJob,
    getPendingJobs,
    approveJob,
    rejectJob
} from '../controllers/job.controller.js';

const router = Router();

// Specific routes FIRST (before :jobId)
router.route('/browse').get(getAllApprovedJobs);
router.route('/student/:studentId/applications').get(getStudentApplications);
router.route('/admin/pending').get(getPendingJobs);
router.route('/admin/:jobId/approve').put(approveJob);
router.route('/admin/:jobId/reject').put(rejectJob);

// TEST ROUTE - Remove in production
router.route('/test/create').post(createTestJob);

// Generic routes LAST
router.route('/:jobId').get(getJobDetails);
router.route('/:jobId/apply').post(applyForJob);
router.route('/:jobId/applicants').get(getJobApplicants);
router.route('/:jobId/applicants/:applicationId/status').put(updateApplicantStatus);

// Company routes
router.route('/create').post(createJob);

export default router;
