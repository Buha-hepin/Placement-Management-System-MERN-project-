import { Router } from 'express';
// User & Student Controllers
import { 
    registerUser, 
    loginUser, 
    getStudentProfile, 
    updateStudentProfile, 
    updateStudentSkills, 
    uploadResume 
} from '../controllers/user.controller.js';

// Company Controllers (From Main Branch)
import { 
    fetchCompanyDetails, 
    editCcompanyDetails, 
    postJob, 
    fetchJobsByCompany 
} from '../controllers/company.controller.js';

import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// Common Routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Student profile routes (Tera Sujal wala code)
router.route('/student/:studentId').get(getStudentProfile);
router.route('/student/:studentId').put(updateStudentProfile);
router.route('/student/:studentId/skills').put(updateStudentSkills);
router.route('/student/:studentId/resume').post(upload.single('resume'), uploadResume);

// Company routes (Main branch wala code)
router.route('/companyDetails/:id').get(fetchCompanyDetails);
router.route('/editCompanyDetails/:id').post(editCcompanyDetails);
router.route('/postjob/:id').post(postJob);
router.route('/fetchjobs/:id').get(fetchJobsByCompany);

export default router;