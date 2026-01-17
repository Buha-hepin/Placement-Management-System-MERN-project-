import { Router } from 'express';
import { registerUser, loginUser, getStudentProfile, updateStudentProfile, updateStudentSkills, uploadResume } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Student profile routes
router.route('/student/:studentId').get(getStudentProfile);
router.route('/student/:studentId').put(updateStudentProfile);
router.route('/student/:studentId/skills').put(updateStudentSkills);
router.route('/student/:studentId/resume').post(upload.single('resume'), uploadResume);

export default router