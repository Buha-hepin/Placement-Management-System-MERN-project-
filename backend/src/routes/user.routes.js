import { Router } from 'express';
// User & Student Controllers
import { 
    registerUser, 
    requestStudentRegistrationOtp,
    verifyStudentRegistrationOtp,
    completeStudentRegistration,
    loginUser, 
    verifyEmail,
    verifyRegistrationOtp,
    forgotPassword,
    resetPassword,
    logoutUser,
    getStudentProfile, 
    updateStudentProfile, 
    updateStudentSkills, 
    uploadResume 
} from '../controllers/user.controller.js';

// Company Controllers (From Main Branch)
import { 
    fetchCompanyDetails, 
    editCompanyDetails, 
    postJob, 
    fetchJobsByCompany 
} from '../controllers/company.controller.js';

import { upload } from '../middlewares/multer.middleware.js';
import { apierror } from '../utils/apierror.js';

const router = Router();

// Common Routes
router.route('/register').post(registerUser);
router.route('/student-registration/request-otp').post(requestStudentRegistrationOtp);
router.route('/student-registration/verify-otp').post(verifyStudentRegistrationOtp);
router.route('/student-registration/complete').post(completeStudentRegistration);
router.route('/verify-email').post(verifyEmail);
router.route('/verify-registration-otp').post(verifyRegistrationOtp);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/logout').post(logoutUser);

// Student profile routes (Tera Sujal wala code)
router.route('/student/:studentId').get(getStudentProfile);
router.route('/student/:studentId').put(updateStudentProfile);
router.route('/student/:studentId/skills').put(updateStudentSkills);
const resumeUpload = (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) return next(new apierror(400, err.message || 'Resume upload failed'));
        return next();
    });
};

router.route('/student/:studentId/resume').post(resumeUpload, uploadResume);

// Company routes (Main branch wala code)
router.route('/companyDetails/:id').get(fetchCompanyDetails);
router.route('/editCompanyDetails/:id').post(editCompanyDetails);
router.route('/postjob/:id').post(postJob);
router.route('/fetchjobs/:id').get(fetchJobsByCompany);

export default router;