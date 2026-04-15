// Admin routes: dashboard, users, jobs management
import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { apierror } from '../utils/apierror.js';
import {
    getAdminDashboard,
    getAllStudents,
    bulkUploadStudentMaster,
    uploadStudentMasterCsv,
    getStudentMasterRecords,
    getStudentAcademicDetails,
    updateStudentOfficialAcademics,
    getAcademicMismatchStudents,
    bulkUploadOfficialAcademics,
    getAllCompanies,
    getCompanyJobsByAdmin,
    deleteStudent,
    deleteCompany,
    deleteStudentMasterRecord,
    getPendingJobs,
    approveJob,
    rejectJob,
    getAllJobs
} from '../controllers/admin.controller.js';

const router = Router();

// Every admin endpoint requires a valid logged-in admin session.
router.use(requireAuth, requireAdmin);

const masterCsvUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return next(new apierror(400, err.message || 'CSV upload failed'));
        return next();
    });
};

// Dashboard
router.route('/dashboard').get(getAdminDashboard);

// Students management
router.route('/students').get(getAllStudents);
router.route('/students/master').get(getStudentMasterRecords);
router.route('/students/master/bulk').post(bulkUploadStudentMaster);
router.route('/students/master/upload-csv').post(masterCsvUpload, uploadStudentMasterCsv);
router.route('/students/master/:recordId').delete(deleteStudentMasterRecord);
router.route('/students/mismatches').get(getAcademicMismatchStudents);
router.route('/students/official-academics/bulk').put(bulkUploadOfficialAcademics);
router.route('/students/:studentId/academics').get(getStudentAcademicDetails);
router.route('/students/:studentId/official-academics').put(updateStudentOfficialAcademics);
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
