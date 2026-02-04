// Admin routes: dashboard, users, jobs management
import { Router } from 'express';
import {
    getAdminDashboard,
    getAllStudents,
    getAllCompanies,
    getCompanyJobsByAdmin,
    deleteStudent,
    deleteCompany,
    getPendingJobs,
    approveJob,
    rejectJob,
    getAllJobs
} from '../controllers/admin.controller.js';

const router = Router();

// Dashboard
router.route('/dashboard').get(getAdminDashboard);

// Students management
router.route('/students').get(getAllStudents);
router.route('/students/:studentId').delete(deleteStudent);

// Companies management
router.route('/companies').get(getAllCompanies);
router.route('/companies/:companyId').delete(deleteCompany);
router.route('/companies/:companyId/jobs').get(getCompanyJobsByAdmin);

// Jobs management
router.route('/jobs').get(getAllJobs);
router.route('/jobs/pending').get(getPendingJobs);
router.route('/jobs/:jobId/approve').put(approveJob);
router.route('/jobs/:jobId/reject').put(rejectJob);

export default router;
