import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
    createAptitudeTest,
    getCompanyTests,
    getTestDetails,
    startTest,
    saveAnswer,
    submitTest,
    getTestResults,
    getTestAnalytics,
    getStudentTestAttempts,
    getStudentAvailableTests
} from '../controllers/aptitudeTest.controller.js';

const router = Router();

// Company routes - Create and view tests
router.route('/company/:companyId/create').post(
    upload.single('pdf'), // Upload PDF file
    createAptitudeTest
);

router.route('/company/:companyId/tests').get(getCompanyTests);

// Test details
router.route('/:testId').get(getTestDetails);

// Student routes - Take tests
router.route('/:testId/start').post(startTest);

router.route('/attempt/:attemptId/save-answer').post(saveAnswer);

router.route('/attempt/:attemptId/submit').post(submitTest);

router.route('/attempt/:attemptId/results').get(getTestResults);

// Analytics and results
router.route('/:testId/analytics').get(getTestAnalytics);

router.route('/student/:studentId/attempts').get(getStudentTestAttempts);
router.route('/student/:studentId/available').get(getStudentAvailableTests);

export default router;
