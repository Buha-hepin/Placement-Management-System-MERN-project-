import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";
import { AptitudeTest } from "../models/aptitudeTest.model.js";
import { TestAttempt } from "../models/testAttempt.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildStartTestPayload = (test, attempt) => {
    const questionOrder = Array.from({ length: test.totalQuestions }, (_, idx) => idx);
    const shouldShuffle = test.restrictions?.shuffleQuestions !== false;

    if (shouldShuffle) {
        for (let i = questionOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionOrder[i], questionOrder[j]] = [questionOrder[j], questionOrder[i]];
        }
    }

    const orderedQuestions = questionOrder.map((originalIndex, displayIndex) => ({
        questionNumber: displayIndex + 1,
        imageUrl: test.questions[originalIndex]?.imageUrl,
        pdfUrl: test.questions[originalIndex]?.pdfUrl,
        pdfPageNumber: test.questions[originalIndex]?.pdfPageNumber,
        originalIndex
    }));

    return {
        attemptId: attempt._id,
        testId: test._id,
        totalQuestions: test.totalQuestions,
        timeLimit: test.timeLimit,
        questions: orderedQuestions,
        shuffled: shouldShuffle,
        restrictions: test.restrictions
    };
};

const hasObjectId = (arr = [], targetId = "") =>
    (arr || []).some((id) => String(id) === String(targetId));

const resolveStudentId = (req, providedId = "") => {
    const authStudentId = String(req.user?.id || "");
    const fallbackStudentId = String(
        providedId || req.params?.studentId || req.body?.studentId || req.query?.studentId || ""
    );
    return authStudentId || fallbackStudentId;
};

const resolveCompanyId = (req, providedId = "") => {
    const authCompanyId = String(req.user?.id || "");
    const fallbackCompanyId = String(
        providedId || req.params?.companyId || req.body?.companyId || req.query?.companyId || ""
    );
    return authCompanyId || fallbackCompanyId;
};

const ensureStudentCanTakeJobTest = async ({ studentId, test, student }) => {
    if (!test?.jobId) return;

    const job = await Job.findById(test.jobId)
        .select("_id jobTitle status applicationDeadline minCGPA interestedStudents")
        .lean();

    if (!job) {
        throw new apierror(404, "Linked job for this test was not found");
    }

    if (job.status !== "approved") {
        throw new apierror(403, "This test is not available because the linked job is not approved");
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
        throw new apierror(403, "This test is not available because the application deadline has passed");
    }

    if (!hasObjectId(job.interestedStudents || [], studentId)) {
        throw new apierror(403, "Mark this job as interested first to access its aptitude test");
    }

    const application = await Application.findOne({ jobId: job._id, studentId }).select("_id").lean();
    if (!application) {
        throw new apierror(403, "Apply for this job first to access its aptitude test");
    }

    if (student?.isPlacementBlocked) {
        throw new apierror(403, "You are blocked from placement activity due to repeated no-shows");
    }

    const requiredCgpa = Math.max(Number(job.minCGPA || 0), Number(test?.restrictions?.minCGPA || 0));
    const studentCgpa = Number(student?.cgpa);
    if (requiredCgpa > 0 && (!Number.isFinite(studentCgpa) || studentCgpa < requiredCgpa)) {
        throw new apierror(403, `Your CGPA (${Number.isFinite(studentCgpa) ? studentCgpa : "N/A"}) is below the minimum required (${requiredCgpa})`);
    }
};

// Create aptitude test from PDF
export const createAptitudeTest = asyncHandler(async (req, res) => {
    const companyId = resolveCompanyId(req, req.params?.companyId);
    const { testName, testDescription, timeLimit, jobId, answerKey, totalMarks, marksPerQuestion, negativeMarking, passingScore, maxAttempts, minCGPA, shuffleQuestions } = req.body;

    // Multipart FormData sends complex fields as strings. Normalize them first.
    let parsedAnswerKey = answerKey;
    if (typeof parsedAnswerKey === "string") {
        try {
            parsedAnswerKey = JSON.parse(parsedAnswerKey);
        } catch (e) {
            throw new apierror(400, "Invalid answerKey format. Expected JSON array like [\"A\",\"B\"]");
        }
    }

    let parsedNegativeMarking = negativeMarking;
    if (typeof parsedNegativeMarking === "string") {
        try {
            parsedNegativeMarking = JSON.parse(parsedNegativeMarking);
        } catch (e) {
            parsedNegativeMarking = { enabled: false, marksPerWrong: 0.5 };
        }
    }

    // Validate required fields
    if (!testName || !timeLimit || !parsedAnswerKey || !totalMarks || !marksPerQuestion) {
        throw new apierror(400, "Missing required fields: testName, timeLimit, answerKey, totalMarks, marksPerQuestion");
    }

    // Validate answer key format
    if (!Array.isArray(parsedAnswerKey) || parsedAnswerKey.length === 0) {
        throw new apierror(400, "answerKey must be a non-empty array");
    }

    if (!parsedAnswerKey.every(ans => ['A', 'B', 'C', 'D'].includes(String(ans).toUpperCase()))) {
        throw new apierror(400, "All answers must be A, B, C, or D");
    }

    // Get company info
    const company = await Company.findById(companyId);
    if (!company) {
        throw new apierror(404, "Company not found");
    }

    try {
        let questionImages = [];

        // If PDF file is uploaded, upload it and map each question to a page.
        if (req.file) {
            const pdfPath = req.file.path;

            const uploadedPdf = await uploadoncloudinary(pdfPath);
            const pdfUrl = uploadedPdf?.secure_url || uploadedPdf?.url;
            if (!pdfUrl) {
                throw new apierror(400, "PDF upload failed. Please check Cloudinary configuration.");
            }

            questionImages = parsedAnswerKey.map((_, idx) => ({
                questionNumber: idx + 1,
                pdfUrl,
                pdfPageNumber: idx + 1,
                imageUrl: null
            }));
        } else {
            // If no PDF provided, validate answer key length
            if (parsedAnswerKey.length === 0) {
                throw new apierror(400, "Please provide a PDF file or specify answer key");
            }
        }

        // Calculate total marks if not provided
        const numericMarksPerQuestion = Number(marksPerQuestion);
        const numericTotalMarks = Number(totalMarks);
        const calculatedTotalMarks = numericTotalMarks || parsedAnswerKey.length * numericMarksPerQuestion;

        // Create aptitude test
        const newTest = new AptitudeTest({
            companyId: companyId,
            companyName: company.companyName,
            jobId: jobId || null,
            testName: testName,
            testDescription: testDescription || "",
            timeLimit: parseInt(timeLimit),
            totalQuestions: parsedAnswerKey.length,
            questions: questionImages,
            answerKey: parsedAnswerKey.map(ans => String(ans).toUpperCase()),
            scoring: {
                totalMarks: calculatedTotalMarks,
                marksPerQuestion: numericMarksPerQuestion,
                negativeMarking: {
                    enabled: parsedNegativeMarking ? Boolean(parsedNegativeMarking.enabled) : false,
                    marksPerWrong: parsedNegativeMarking?.marksPerWrong ? Number(parsedNegativeMarking.marksPerWrong) : 0.5
                },
                passingScore: parseInt(passingScore) || 60
            },
            restrictions: {
                maxAttempts: maxAttempts ? parseInt(maxAttempts) : 1,
                tabSwitchLimit: 3,
                shuffleQuestions: String(shuffleQuestions) !== "false",
                minCGPA: minCGPA ? parseFloat(minCGPA) : 0
            }
        });

        await newTest.save();

        // If jobId provided, link test to job
        if (jobId) {
            await Job.findByIdAndUpdate(jobId, { aptitudeTestId: newTest._id });
        }

        res.status(201).json(
            new apiResponse(
                201,
                newTest,
                "Aptitude test created successfully"
            )
        );
    } catch (error) {
        console.error("Error creating test:", error);
        throw error;
    }
});

// Get all tests created by a company
export const getCompanyTests = asyncHandler(async (req, res) => {
    const companyId = resolveCompanyId(req, req.params?.companyId);

    const tests = await AptitudeTest.find({ companyId: companyId })
        .select("-answerKey") // Don't send answer key to frontend unnecessarily
        .populate("jobId", "jobTitle")
        .sort({ createdAt: -1 });

    res.status(200).json(
        new apiResponse(200, tests, "Tests fetched successfully")
    );
});

// Get single test details
export const getTestDetails = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    const test = await AptitudeTest.findById(testId)
        .select("-answerKey") // Hide answer key from student view
        .populate("jobId", "jobTitle companyName");

    if (!test) {
        throw new apierror(404, "Test not found");
    }

    res.status(200).json(
        new apiResponse(200, test, "Test details fetched successfully")
    );
});

// Start test: create a TestAttempt record
export const startTest = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const studentId = resolveStudentId(req, req.body?.studentId);

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        throw new apierror(400, "Invalid test ID");
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new apierror(400, "Invalid student ID");
    }

    // Validate test exists
    const test = await AptitudeTest.findById(testId);
    if (!test) {
        throw new apierror(404, "Test not found");
    }

    // Validate student exists and check eligibility
    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    await ensureStudentCanTakeJobTest({ studentId, test, student });

    // Check CGPA eligibility
    if (student.cgpa < test.restrictions.minCGPA) {
        throw new apierror(403, `Your CGPA (${student.cgpa}) is below the minimum required (${test.restrictions.minCGPA})`);
    }

    // If an attempt is already ongoing, return it instead of creating a duplicate.
    const ongoingAttempt = await TestAttempt.findOne({
        testId,
        studentId,
        status: "ongoing"
    }).sort({ attemptNumber: -1 });

    if (ongoingAttempt) {
        return res.status(200).json(
            new apiResponse(200, buildStartTestPayload(test, ongoingAttempt), "Resuming existing test attempt")
        );
    }

    const attemptCount = await TestAttempt.countDocuments({ testId, studentId });

    if (attemptCount >= test.restrictions.maxAttempts) {
        throw new apierror(403, `You have already attempted this test ${test.restrictions.maxAttempts} time(s)`);
    }

    // Create new test attempt
    const newAttempt = new TestAttempt({
        testId,
        studentId,
        companyId: test.companyId,
        jobId: test.jobId || null,
        startTime: new Date(),
        attemptNumber: attemptCount + 1,
        studentAnswers: new Array(test.totalQuestions).fill(null)
    });

    try {
        await newAttempt.save();
    } catch (error) {
        if (error?.code === 11000) {
            const duplicateAttempt = await TestAttempt.findOne({
                testId,
                studentId,
                status: "ongoing"
            }).sort({ attemptNumber: -1 });

            if (duplicateAttempt) {
                return res.status(200).json(
                    new apiResponse(200, buildStartTestPayload(test, duplicateAttempt), "Resuming existing test attempt")
                );
            }
        }

        throw error;
    }

    // Return test details (without answer key) and attempt ID
    res.status(200).json(
        new apiResponse(
            200,
            buildStartTestPayload(test, newAttempt),
            "Test started successfully"
        )
    );
});

// Save answer to a question
export const saveAnswer = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { questionIndex, answer, tabSwitches } = req.body;

    // Validate inputs
    if (questionIndex === undefined || !answer) {
        throw new apierror(400, "questionIndex and answer are required");
    }

    if (!['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
        throw new apierror(400, "Answer must be A, B, C, or D");
    }

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
        throw new apierror(404, "Test attempt not found");
    }

    const studentId = resolveStudentId(req);
    if (studentId && String(attempt.studentId) !== studentId) {
        throw new apierror(403, "You are not authorized to update this attempt");
    }

    // Check if test time has exceeded
    const test = await AptitudeTest.findById(attempt.testId);
    const elapsedMinutes = (new Date() - attempt.startTime) / 60000;
    if (elapsedMinutes > test.timeLimit) {
        // Auto-submit the test with timeout reason
        const result = await performTestSubmit(attemptId, "timeout");
        return res.status(200).json(
            new apiResponse(
                200,
                { message: "Test auto-submitted due to time limit exceeded", ...result },
                "Test submitted due to timeout"
            )
        );
    }

    // Update answer
    attempt.studentAnswers[questionIndex] = answer.toUpperCase();

    // Update tab switches if provided
    if (tabSwitches !== undefined) {
        attempt.tabSwitches = tabSwitches;

        // Check if exceeded tab limit (4th switch = limit of 3)
        if (tabSwitches > test.restrictions.tabSwitchLimit) {
            attempt.submitReason = "tab_switch";
            attempt.submitTime = new Date();
            attempt.status = "submitted";
            await attempt.save();

            // Calculate score
            await evaluateTest(attemptId);

            return res.status(200).json(
                new apiResponse(
                    200,
                    { message: "Test auto-submitted due to tab switches exceeded" },
                    "Test submitted due to tab switch limit"
                )
            );
        }
    }

    await attempt.save();

    res.status(200).json(
        new apiResponse(200, { saved: true }, "Answer saved successfully")
    );
});

// Internal helper: Perform test submission and evaluation (safe for internal calls)
async function performTestSubmit(attemptId, submitReason = "completed") {
    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
        throw new apierror(404, "Test attempt not found");
    }

    if (attempt.status !== "ongoing") {
        throw new apierror(400, "Test already submitted");
    }

    attempt.submitTime = new Date();
    attempt.submitReason = submitReason;
    attempt.status = "submitted";
    await attempt.save();

    // Evaluate the test
    await evaluateTest(attemptId);

    // Get the latest evaluation
    const updatedAttempt = await TestAttempt.findById(attemptId);

    return {
        score: updatedAttempt.score,
        percentage: updatedAttempt.percentage,
        passed: updatedAttempt.passed,
        correctAnswers: updatedAttempt.correctAnswers,
        wrongAnswers: updatedAttempt.wrongAnswers,
        unansweredCount: updatedAttempt.unansweredCount
    };
}

// Submit test
export const submitTest = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId);
    if (!attempt) {
        throw new apierror(404, "Test attempt not found");
    }

    const studentId = resolveStudentId(req);
    if (studentId && String(attempt.studentId) !== studentId) {
        throw new apierror(403, "You are not authorized to submit this attempt");
    }

    const result = await performTestSubmit(attemptId, "completed");

    res.status(200).json(
        new apiResponse(
            200,
            result,
            "Test submitted and evaluated successfully"
        )
    );
});

// Helper function to evaluate test
async function evaluateTest(attemptId) {
    const attempt = await TestAttempt.findById(attemptId);
    const test = await AptitudeTest.findById(attempt.testId);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    // Compare answers with answer key
    attempt.studentAnswers.forEach((answer, index) => {
        if (answer === null || answer === undefined || answer === '') {
            unansweredCount++;
        } else if (answer.toUpperCase() === test.answerKey[index]) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    // Calculate score
    let score = correctCount * test.scoring.marksPerQuestion;

    // Apply negative marking if enabled
    if (test.scoring.negativeMarking.enabled) {
        score -= wrongCount * test.scoring.negativeMarking.marksPerWrong;
    }

    // Ensure score doesn't go negative
    score = Math.max(0, score);

    const percentage = (score / test.scoring.totalMarks) * 100;
    const passed = percentage >= test.scoring.passingScore;

    // Update attempt with evaluation
    attempt.correctAnswers = correctCount;
    attempt.wrongAnswers = wrongCount;
    attempt.unansweredCount = unansweredCount;
    attempt.score = parseFloat(score.toFixed(2));
    attempt.percentage = parseFloat(percentage.toFixed(2));
    attempt.passed = passed;
    attempt.status = "evaluated";

    await attempt.save();
}

// Get test results
export const getTestResults = asyncHandler(async (req, res) => {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId)
        .populate("testId", "testName scoring.totalMarks")
        .populate("studentId", "fullname enrollmentNo");

    if (!attempt) {
        throw new apierror(404, "Test attempt not found");
    }

    const studentId = resolveStudentId(req);
    if (studentId && String(attempt.studentId?._id || attempt.studentId) !== studentId) {
        throw new apierror(403, "You are not authorized to view these results");
    }

    if (attempt.status !== "evaluated") {
        throw new apierror(400, "Test has not been evaluated yet");
    }

    res.status(200).json(
        new apiResponse(
            200,
            {
                attemptId: attempt._id,
                studentName: attempt.studentId?.fullname,
                testName: attempt.testId?.testName,
                score: attempt.score,
                percentage: attempt.percentage,
                passed: attempt.passed,
                correctAnswers: attempt.correctAnswers,
                wrongAnswers: attempt.wrongAnswers,
                unansweredCount: attempt.unansweredCount,
                totalQuestions: attempt.studentAnswers.length,
                submitTime: attempt.submitTime,
                submitReason: attempt.submitReason
                // Note: We don't return answerKey or studentAnswers to prevent cheating
            },
            "Results fetched successfully"
        )
    );
});

// Get company analytics for a test
export const getTestAnalytics = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const role = String(req.user?.role || '').toLowerCase();
    const companyId = role === 'company' ? resolveCompanyId(req) : null;

    const test = await AptitudeTest.findById(testId);
    if (!test) {
        throw new apierror(404, "Test not found");
    }

    if (role === 'company' && String(test.companyId) !== companyId) {
        throw new apierror(403, "You are not authorized to view analytics for this test");
    }

    // Get all attempts for this test
    const attempts = await TestAttempt.find({ testId: testId, status: "evaluated" })
        .select("studentId percentage passed score");

    const totalAttempts = attempts.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const failedCount = totalAttempts - passedCount;

    const averageScore = totalAttempts > 0 
        ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(2)
        : 0;

    const highestScore = totalAttempts > 0 
        ? Math.max(...attempts.map(a => a.percentage))
        : 0;

    const lowestScore = totalAttempts > 0 
        ? Math.min(...attempts.map(a => a.percentage))
        : 0;

    res.status(200).json(
        new apiResponse(
            200,
            {
                testName: test.testName,
                totalAttempts,
                passedCount,
                failedCount,
                passPercentage: totalAttempts > 0 ? ((passedCount / totalAttempts) * 100).toFixed(2) : 0,
                averageScore,
                highestScore,
                lowestScore,
                passingScore: test.scoring.passingScore
            },
            "Analytics fetched successfully"
        )
    );
});

// Get student's test attempts (for results page)
export const getStudentTestAttempts = asyncHandler(async (req, res) => {
    const studentId = resolveStudentId(req, req.params?.studentId);

    const attempts = await TestAttempt.find({ studentId: studentId, status: "evaluated" })
        .populate("testId", "testName companyName")
        .select("testId percentage score passed submitTime")
        .sort({ submitTime: -1 });

    res.status(200).json(
        new apiResponse(200, attempts, "Student test attempts fetched successfully")
    );
});

// Get all tests available to a student (tests for jobs they applied to + open tests)
export const getStudentAvailableTests = asyncHandler(async (req, res) => {
    const studentId = resolveStudentId(req, req.params?.studentId);

    const student = await User.findById(studentId).select('cgpa isPlacementBlocked').lean();
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    // Only job-linked tests are visible, and only when student is both interested and applied.
    const applications = await Application.find({ studentId }).select('jobId').lean();
    const appliedJobIds = applications.map((app) => app.jobId).filter(Boolean);

    const jobs = await Job.find({
        _id: { $in: appliedJobIds },
        status: "approved",
        applicationDeadline: { $gte: new Date() },
        aptitudeTestId: { $ne: null },
        interestedStudents: new mongoose.Types.ObjectId(studentId)
    }).select('_id minCGPA').lean();

    const eligibleJobIds = jobs
        .filter((job) => {
            if (student.isPlacementBlocked) return false;
            const requiredCgpa = Number(job.minCGPA || 0);
            const studentCgpa = Number(student.cgpa);
            if (requiredCgpa <= 0) return true;
            return Number.isFinite(studentCgpa) && studentCgpa >= requiredCgpa;
        })
        .map((job) => job._id);

    const tests = await AptitudeTest.find({
        isActive: true,
        jobId: { $in: eligibleJobIds }
    })
        .select('-answerKey')
        .populate('jobId', 'jobTitle')
        .lean();

    // Fetch student's existing attempts to show attempt status
    const existingAttempts = await TestAttempt.find({ studentId })
        .select('testId status percentage passed')
        .lean();

    const attemptMap = {};
    existingAttempts.forEach(a => {
        attemptMap[a.testId.toString()] = a;
    });

    const testsWithStatus = tests.map(t => ({
        ...t,
        attempt: attemptMap[t._id.toString()] || null
    }));

    res.status(200).json(
        new apiResponse(200, testsWithStatus, "Available tests fetched successfully")
    );
});
