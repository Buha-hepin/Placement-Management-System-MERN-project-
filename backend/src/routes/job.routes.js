import { Router } from 'express';
import { 
    getAllApprovedJobs, 
    getJobDetails, 
    applyForJob,
    getStudentApplications,
    createJob,
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

// Generic routes LAST
router.route('/:jobId').get(getJobDetails);
router.route('/:jobId/apply').post(applyForJob);

// Company routes
router.route('/create').post(createJob);

export default router;
