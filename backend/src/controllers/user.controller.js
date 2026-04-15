// User controller: student/company/admin auth and student profile ops
import { asyncHandler } from "../utils/asynchandler.js";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { StudentMaster } from "../models/studentMaster.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import{ apiResponse } from "../utils/apiResponse.js";
import { sendOTPEmail, sendPasswordResetEmail, sendNotificationEmail } from "../utils/emailSender.js";
import { sendOTPSMS } from "../utils/smsSender.js";
import { compareAcademicRecords, normalizeSemesterRecord } from "../utils/academicCompare.js";
import { evaluateStudentProfileCompletion } from "../utils/studentProfileCompletion.js";
import jwt from "jsonwebtoken";

const ACADEMIC_MISMATCH_ALERT_THRESHOLD = 3;

const sendAcademicMismatchAlertToAdmin = async ({ student, verification }) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) return { skipped: true };

    const details = Array.isArray(verification?.mismatchDetails)
        ? verification.mismatchDetails.slice(0, 8)
        : [];

    const detailLines = details
        .map((item) => `<li>Sem ${item.semester} | ${item.field}: ${item.reason}</li>`)
        .join("");

    const subject = `Academic mismatch alert: ${student?.fullname || "Student"}`;
    const text = `Student ${student?.fullname || "N/A"} (${student?.enrollmentNo || "N/A"}) has ${verification?.mismatchCount || 0} academic mismatches.`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
            <h3 style="color: #b91c1c;">Student Academic Mismatch Alert</h3>
            <p><strong>Name:</strong> ${student?.fullname || "N/A"}</p>
            <p><strong>Enrollment:</strong> ${student?.enrollmentNo || "N/A"}</p>
            <p><strong>Email:</strong> ${student?.email || "N/A"}</p>
            <p><strong>Mismatch Count:</strong> ${verification?.mismatchCount || 0}</p>
            <p><strong>Mismatch Semesters:</strong> ${(verification?.mismatchSemesters || []).join(", ") || "N/A"}</p>
            ${detailLines ? `<p><strong>Top mismatch details:</strong></p><ul>${detailLines}</ul>` : ""}
            <p style="color: #6b7280; font-size: 12px;">Generated automatically by Placement Management System.</p>
        </div>
    `;

    return sendNotificationEmail(adminEmail, subject, html, text);
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};   

const normalizeEnrollmentNo = (value) => String(value || "").trim().toUpperCase();

const validateEnrollmentFormat = (enrollmentNo) => {
    const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;
    return enrollmentRegex.test(enrollmentNo);
};

const isDevOtpFallbackEnabled = () => {
    const explicitToggle = String(process.env.ALLOW_OTP_DEV_FALLBACK || "").trim().toLowerCase();
    if (explicitToggle) {
        return ["1", "true", "yes", "on"].includes(explicitToggle);
    }
    return process.env.NODE_ENV !== "production";
};

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_change_me";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "7d";

const buildAccessToken = ({ id, role, email }) => {
    return jwt.sign({ id, role, email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const accessCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
};

const resolveStudentAuthId = (req, providedId = "") => {
    const authStudentId = String(req.user?.id || "");
    const fallbackStudentId = String(
        providedId || req.params?.studentId || req.body?.studentId || req.query?.studentId || ""
    );

    const resolvedId = authStudentId || fallbackStudentId;
    if (!resolvedId) {
        throw new apierror(400, "Student ID is required");
    }

    return resolvedId;
};

// Step 1: Student enters enrollment number and OTP is sent on preloaded phone.
export const requestStudentRegistrationOtp = asyncHandler(async (req, res) => {
    const { enrollmentNo } = req.body;
    const normalizedEnrollment = normalizeEnrollmentNo(enrollmentNo);

    if (!normalizedEnrollment) {
        throw new apierror(400, "Enrollment number is required");
    }

    if (!validateEnrollmentFormat(normalizedEnrollment)) {
        throw new apierror(400, "Invalid enrollment number format. Expected format: YYBEBRANCHTTT##");
    }

    const masterStudent = await StudentMaster.findOne({ enrollmentNo: normalizedEnrollment, isActive: true });
    if (!masterStudent) {
        throw new apierror(403, "Enrollment number is not authorized for registration. Contact college admin.");
    }

    if (masterStudent.isClaimed) {
        throw new apierror(400, "This enrollment number is already registered.");
    }

    const existingUser = await User.findOne({ enrollmentNo: normalizedEnrollment });
    if (existingUser) {
        throw new apierror(400, "This enrollment number is already registered.");
    }

    const otp = generateOTP();
    masterStudent.registrationOtp = otp;
    masterStudent.registrationOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    masterStudent.registrationOtpVerifiedAt = null;
    masterStudent.registrationOtpAttempts = 0;

    let smsResult = null;
    let otpChannel = "sms";
    let devFallbackMessage = null;
    try {
        smsResult = await sendOTPSMS(masterStudent.phone, otp, "Student");
    } catch (error) {
        const errorMessage = String(error?.message || "");
        const trialRestriction = errorMessage.includes('"code":21608');
        if (isDevOtpFallbackEnabled()) {
            otpChannel = "dev";
            devFallbackMessage = trialRestriction
                ? "Twilio trial restriction hit. Using development OTP fallback."
                : "SMS delivery failed. Using development OTP fallback.";
            console.warn(`[OTP DEV FALLBACK] enrollment=${normalizedEnrollment} otp=${otp} reason=${errorMessage}`);
        } else if (trialRestriction) {
            throw new apierror(
                502,
                "SMS not delivered: Twilio trial account can only send OTP to verified numbers. Verify this phone in Twilio Console (Verified Caller IDs) or upgrade Twilio account."
            );
        } else {
            throw new apierror(502, errorMessage || "Unable to send OTP to registered phone number.");
        }
    }

    if (smsResult?.skipped) {
        if (isDevOtpFallbackEnabled()) {
            otpChannel = "dev";
            devFallbackMessage = `SMS OTP service unavailable: ${smsResult.reason || "unknown reason"}. Using development OTP fallback.`;
            console.warn(`[OTP DEV FALLBACK] enrollment=${normalizedEnrollment} otp=${otp} reason=${smsResult.reason || "unknown"}`);
        } else {
            throw new apierror(502, `SMS OTP service unavailable: ${smsResult.reason || "unknown reason"}`);
        }
    }

    await masterStudent.save();

    return res.status(200).json(
        new apiResponse(
            200,
            {
                enrollmentNo: normalizedEnrollment,
                otpContact: otpChannel === "sms" ? (smsResult?.to || masterStudent.phone) : "development fallback",
                otpChannel,
                devOtp: otpChannel === "dev" ? otp : undefined,
                devMessage: otpChannel === "dev" ? devFallbackMessage : undefined
            },
            otpChannel === "sms"
                ? "OTP sent to registered phone number."
                : "OTP generated using development fallback."
        )
    );
});

// Step 2: Verify OTP. After this, student is allowed to set password and complete account.
export const verifyStudentRegistrationOtp = asyncHandler(async (req, res) => {
    const { enrollmentNo, otp } = req.body;
    const normalizedEnrollment = normalizeEnrollmentNo(enrollmentNo);
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEnrollment || !normalizedOtp) {
        throw new apierror(400, "Enrollment number and OTP are required");
    }

    const masterStudent = await StudentMaster.findOne({ enrollmentNo: normalizedEnrollment, isActive: true });
    if (!masterStudent) {
        throw new apierror(404, "Student record not found");
    }

    if (masterStudent.isClaimed) {
        throw new apierror(400, "This enrollment number is already registered.");
    }

    if (!masterStudent.registrationOtp || !masterStudent.registrationOtpExpiry) {
        throw new apierror(400, "OTP not requested. Please request OTP first.");
    }

    if (new Date() > masterStudent.registrationOtpExpiry) {
        throw new apierror(400, "OTP expired. Please request a new OTP.");
    }

    if (masterStudent.registrationOtp !== normalizedOtp) {
        masterStudent.registrationOtpAttempts = Number(masterStudent.registrationOtpAttempts || 0) + 1;
        await masterStudent.save();
        throw new apierror(400, "Invalid OTP");
    }

    masterStudent.registrationOtp = null;
    masterStudent.registrationOtpExpiry = null;
    masterStudent.registrationOtpAttempts = 0;
    masterStudent.registrationOtpVerifiedAt = new Date();
    await masterStudent.save();

    return res.status(200).json(
        new apiResponse(200, { enrollmentNo: normalizedEnrollment }, "OTP verified. You can now set password and complete registration.")
    );
});

// Step 3: Complete registration after OTP verification.
export const completeStudentRegistration = asyncHandler(async (req, res) => {
    const { enrollmentNo, fullName, email, password, branch, skills, resumeUrl } = req.body;
    const normalizedEnrollment = normalizeEnrollmentNo(enrollmentNo);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (![normalizedEnrollment, fullName, normalizedEmail, password].every((field) => String(field || "").trim().length > 0)) {
        throw new apierror(400, "Enrollment number, full name, email, and password are required");
    }

    if (!validateEnrollmentFormat(normalizedEnrollment)) {
        throw new apierror(400, "Invalid enrollment number format. Expected format: YYBEBRANCHTTT##");
    }

    if (String(password).length < 6) {
        throw new apierror(400, "Password must be at least 6 characters long");
    }

    const masterStudent = await StudentMaster.findOne({ enrollmentNo: normalizedEnrollment, isActive: true });
    if (!masterStudent) {
        throw new apierror(403, "Enrollment number is not authorized for registration. Contact college admin.");
    }

    if (masterStudent.isClaimed) {
        throw new apierror(400, "This enrollment number has already been claimed.");
    }

    if (!masterStudent.registrationOtpVerifiedAt) {
        throw new apierror(403, "Please verify OTP first.");
    }

    // OTP verification is valid for 15 minutes to complete signup.
    if (new Date().getTime() - new Date(masterStudent.registrationOtpVerifiedAt).getTime() > 15 * 60 * 1000) {
        masterStudent.registrationOtpVerifiedAt = null;
        await masterStudent.save();
        throw new apierror(400, "OTP verification session expired. Please verify OTP again.");
    }

    if (masterStudent.email && masterStudent.email !== normalizedEmail) {
        throw new apierror(400, "Email does not match the college record for this enrollment number.");
    }

    const existingByEnrollment = await User.findOne({ enrollmentNo: normalizedEnrollment });
    if (existingByEnrollment) {
        throw new apierror(400, "Enrollment number already registered.");
    }

    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) {
        throw new apierror(400, "Email already registered. Please use a different email.");
    }

    const user = await User.create({
        enrollmentNo: normalizedEnrollment,
        fullname: String(fullName).trim(),
        email: normalizedEmail,
        password,
        branch,
        phone: masterStudent.phone,
        skills,
        resumeUrl,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null
    });

    masterStudent.isClaimed = true;
    masterStudent.claimedBy = user._id;
    masterStudent.claimedAt = new Date();
    masterStudent.registrationOtpVerifiedAt = null;
    await masterStudent.save();

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken");

    return res.status(201).json(
        new apiResponse(201, createdUser, "Registration completed successfully. You can now login.")
    );
});


// Register user
// role === 'student' or 'company' determines which model to use
export const registerUser = asyncHandler(async(req,res)=>{
    const {role} = req.body;

    if (role === "student") {
        try {
            const { enrollmentNo, fullName, email, password, branch, skills, resumeUrl } = req.body;
            const normalizedEnrollment = enrollmentNo?.trim().toUpperCase();
            const normalizedEmail = email?.trim().toLowerCase();

            // Ensure required fields are present and non-empty
            if (![enrollmentNo, fullName, email, password].every(field => typeof field === 'string' && field.trim().length > 0)) {
                throw new apierror(400, "Enrollment number, full name, email, and password are required");
            }

            // Validate enrollment number format: YYBEBRANCHTTT##
            // Example: 23BEIT30055 (year-BE-branch-batch-student)
            const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;
            if (!enrollmentRegex.test(normalizedEnrollment)) {
                throw new apierror(400, "Invalid enrollment number format. Expected format: YYBEBRANCHTTT## (e.g., 23BEIT30055)");
            }

            // Allow registration only if enrollment is preloaded by admin.
            const masterStudent = await StudentMaster.findOne({ enrollmentNo: normalizedEnrollment, isActive: true });
            if (!masterStudent) {
                throw new apierror(403, "Enrollment number is not authorized for registration. Contact college admin.");
            }

            if (masterStudent.isClaimed) {
                throw new apierror(400, "This enrollment number has already been claimed.");
            }

            if (masterStudent.email && masterStudent.email !== normalizedEmail) {
                throw new apierror(400, "Email does not match the college record for this enrollment number.");
            }

            // Check for existing user by enrollment number (must be unique)
            const existingByEnrollment = await User.findOne({ enrollmentNo: normalizedEnrollment });
            if (existingByEnrollment) {
                throw new apierror(400, "Enrollment number already registered. Please use a different enrollment number.");
            }
            
            // Also check email uniqueness
            const existingByEmail = await User.findOne({ email: normalizedEmail });
            if (existingByEmail) {
                throw new apierror(400, "Email already registered. Please use a different email.");
            }

            const emailOtp = generateOTP();

            const user = await User.create({
                enrollmentNo: normalizedEnrollment,
                fullname: fullName,
                email: normalizedEmail,
                password,
                branch,
                phone: masterStudent.phone,
                skills,
                resumeUrl,
                isEmailVerified: false,
                emailVerificationToken: emailOtp,
                emailVerificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
            });

            const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken");
            if (!createdUser) {
                throw new apierror(500, "User creation failed");
            }

            let otpChannel = "email";
            let otpContact = normalizedEmail;
            try {
                const smsResult = await sendOTPSMS(masterStudent.phone, emailOtp, fullName);
                if (smsResult?.skipped) {
                    await sendOTPEmail(normalizedEmail, emailOtp, fullName);
                } else {
                    otpChannel = "sms";
                    otpContact = smsResult.to || masterStudent.phone;
                }
            } catch (emailError) {
                try {
                    await sendOTPEmail(normalizedEmail, emailOtp, fullName);
                    otpChannel = "email";
                    otpContact = normalizedEmail;
                } catch (fallbackError) {
                    await User.deleteOne({ _id: user._id });
                    throw new apierror(502, "Unable to deliver OTP by SMS/email. Please try again.");
                }
            }

            return res.status(201).json(new apiResponse(201, {
                enrollmentNo: normalizedEnrollment,
                otpContact,
                otpChannel,
                registeredPhone: masterStudent.phone
            }, "OTP sent successfully. Please verify to complete registration."));
        } catch (error) {
            // Mongo duplicate key
            if (error && error.code === 11000) {
                const key = Object.keys(error.keyValue || {})[0] || 'field';
                throw new apierror(400, `${key} already exists`);
            }
            if (error instanceof apierror) throw error;
            console.error('registerUser (student) error:', error);
            throw new apierror(500, error.message || "User controller error");
        }
    }

    if (role === "company") {
        try {
            const { companyName, email, password, Location } = req.body;

            if (![companyName, email, password].every(field => typeof field === 'string' && field.trim().length > 0)) {
                throw new apierror(400, "All fields are required");
            }

            const existedUser = await Company.findOne({ $or: [{ companyName }, { email: email.toLowerCase() }] });
            if (existedUser) {
                throw new apierror(400, "Company already exists");
            }

            const user = await Company.create({
                companyName,
                email: email.toLowerCase(),
                password,
                location: Location
            });

            const createdUser = await Company.findById(user._id).select("-password -refreshToken");
            if (!createdUser) {
                throw new apierror(500, "Company creation failed");
            }

            return res.status(201).json(new apiResponse(201, createdUser, "Company registered successfully"));
        } catch (error) {
            if (error && error.code === 11000) {
                const key = Object.keys(error.keyValue || {})[0] || 'field';
                throw new apierror(400, `${key} already exists`);
            }
            if (error instanceof apierror) throw error;
            console.error('registerUser (company) error:', error);
            throw new apierror(500, error.message || "Company controller error");
        }
    }
    

})

// Login user
// Supports student/company/admin; returns sanitized user/admin data
export const loginUser = asyncHandler(async(req,res)=>{
    const requestedRole = String(req.body?.role || "").trim().toLowerCase();

    if(requestedRole==="student"){
        const {enrollmentNo,password} = req.body;
        if ([enrollmentNo, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }   

        const user = await User.findOne({enrollmentNo: enrollmentNo.trim().toUpperCase()});
        if(!user || !(await user.comparePassword(password))){
            throw new apierror(401,"Invalid enrollment number or password");
        }

        if (!user.isEmailVerified) {
            throw new apierror(403, "Please verify your email address first.");
        }

        const accessToken = buildAccessToken({ id: user._id, role: "student", email: user.email });
        const userData = await User.findById(user._id).select("-password -refreshToken");
        const completion = evaluateStudentProfileCompletion(userData?.toObject?.() || userData || {});
        const responseData = {
            ...(userData?.toObject?.() || {}),
            isProfileComplete: completion.isComplete,
            missingProfileFields: completion.missingFields
        };
        return res.status(200).cookie("student-token", accessToken, accessCookieOptions).json(
            new apiResponse(200,responseData,"Student logged in successfully")
        )
    }
    if(requestedRole==="company"){
        const {email,password} = req.body;  
        if ([email, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }   

        const company = await Company.findOne({email: email.toLowerCase()});
        if(!company || !(await company.comparePassword(password))){
            throw new apierror(401,"Invalid email or password");
        }
        const accessToken = buildAccessToken({ id: company._id, role: "company", email: company.email });
        const companyData = await Company.findById(company._id).select("-password -refreshToken");
        return res.status(200).cookie("company-token", accessToken, accessCookieOptions).json(
            new apiResponse(200,companyData,"Company logged in successfully")
        )
    }
    if(requestedRole==="admin"){
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "").trim();
        const adminEmail = String(process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
        const adminPasswords = [
            String(process.env.ADMIN_PASSWORD || "").trim(),
            String(process.env.ADMIN_PASSWORD_ALT || "").trim(),
            "Admin@123"
        ].filter(Boolean);
        const allowDevAdminBypass =
            process.env.NODE_ENV !== "production" &&
            !["0", "false", "no", "off"].includes(
                String(process.env.ALLOW_DEV_ADMIN_BYPASS || "true").trim().toLowerCase()
            );

        if(email!==adminEmail){
            throw new apierror(401,"Invalid admin credentials");
        }

        if(!adminPasswords.includes(password) && !allowDevAdminBypass){
            throw new apierror(401,"Invalid admin credentials");
        }

        if(!adminPasswords.includes(password) && allowDevAdminBypass){
            console.warn("[DEV ADMIN BYPASS] Admin login allowed with fallback password policy.");
        }
        const adminData = {
            email:adminEmail,
            role:"admin"    
        };
        const accessToken = buildAccessToken({ id: "admin", role: "admin", email: adminEmail });
        return res.status(200).cookie("admin-token", accessToken, accessCookieOptions).json(
            new apiResponse(200,adminData,"Admin logged in successfully")
        )
    }

    throw new apierror(400, "Invalid role. Use student, company, or admin");
})

// Logout current user by clearing auth cookie
export const logoutUser = asyncHandler(async (_req, res) => {
    return res
        .status(200)
        .clearCookie("student-token", clearCookieOptions)
        .clearCookie("company-token", clearCookieOptions)
        .clearCookie("admin-token", clearCookieOptions)
        .json(new apiResponse(200, null, "Logged out successfully"));
});

// Get student profile by ID
export const getStudentProfile = asyncHandler(async(req,res)=>{
    const studentId = resolveStudentAuthId(req, req.params?.studentId);

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findById(studentId).select("-password -refreshToken");
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const completion = evaluateStudentProfileCompletion(student.toObject());
    const responseData = {
        ...student.toObject(),
        isProfileComplete: completion.isComplete,
        missingProfileFields: completion.missingFields
    };

    return res.status(200).json(
        new apiResponse(200, responseData, "Student profile retrieved successfully")
    );
})

// Update student profile
export const updateStudentProfile = asyncHandler(async(req,res)=>{
    const studentId = resolveStudentAuthId(req, req.params?.studentId);
    const { fullname, email, branch, cgpa, phone, semesterAcademicRecords } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const previousMismatchCount = Number(student?.academicVerification?.mismatchCount || 0);
    const previousHasMismatch = Boolean(student?.academicVerification?.hasMismatch);

    const normalizedRecords = Array.isArray(semesterAcademicRecords)
        ? semesterAcademicRecords
            .map(normalizeSemesterRecord)
            .filter((record) => record.semester >= 1 && record.semester <= 8)
            .sort((a, b) => a.semester - b.semester)
        : student.semesterAcademicRecords;

    const draftForValidation = {
        ...student.toObject(),
        fullname: String(fullname ?? student.fullname ?? '').trim(),
        email: String(email ?? student.email ?? '').trim().toLowerCase(),
        branch: String(branch ?? student.branch ?? '').trim(),
        phone: String(phone ?? student.phone ?? '').trim(),
        cgpa: Number(cgpa ?? student.cgpa),
        semesterAcademicRecords: normalizedRecords
    };

    student.fullname = draftForValidation.fullname;
    student.email = draftForValidation.email;
    student.branch = draftForValidation.branch;
    student.cgpa = draftForValidation.cgpa;
    student.phone = draftForValidation.phone;
    student.semesterAcademicRecords = normalizedRecords;

    const verification = compareAcademicRecords(student.semesterAcademicRecords || [], student.adminAcademicRecords || []);
    student.academicVerification = {
        hasMismatch: verification.hasMismatch,
        mismatchCount: verification.mismatchCount,
        mismatchSemesters: verification.mismatchSemesters,
        mismatchDetails: verification.mismatchDetails,
        lastComparedAt: verification.comparedAt
    };

    const crossedAlertThreshold =
        verification.hasMismatch &&
        verification.mismatchCount >= ACADEMIC_MISMATCH_ALERT_THRESHOLD &&
        (!previousHasMismatch || previousMismatchCount < ACADEMIC_MISMATCH_ALERT_THRESHOLD);

    if (crossedAlertThreshold) {
        try {
            await sendAcademicMismatchAlertToAdmin({ student, verification });
        } catch (err) {
            console.error("Academic mismatch admin alert failed:", err.message);
        }
    }

    const updatedStudent = await student.save();
    const profileData = await User.findById(updatedStudent._id).select("-password -refreshToken");
    const profileCompletion = evaluateStudentProfileCompletion(profileData?.toObject?.() || profileData || {});
    const responseData = {
        ...(profileData?.toObject?.() || {}),
        isProfileComplete: profileCompletion.isComplete,
        missingProfileFields: profileCompletion.missingFields
    };

    return res.status(200).json(
        new apiResponse(200, responseData, "Student profile updated successfully")
    );
})

// Update student skills (array)
export const updateStudentSkills = asyncHandler(async(req,res)=>{
    const studentId = resolveStudentAuthId(req, req.params?.studentId);
    const { skills } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!Array.isArray(skills)) {
        throw new apierror(400, "Skills must be an array");
    }

    const student = await User.findByIdAndUpdate(
        studentId,
        { skills },
        { new: true }
    ).select("-password -refreshToken");

    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const completion = evaluateStudentProfileCompletion(student?.toObject?.() || student || {});
    const responseData = {
        ...(student?.toObject?.() || {}),
        isProfileComplete: completion.isComplete,
        missingProfileFields: completion.missingFields
    };

    return res.status(200).json(
        new apiResponse(200, responseData, "Student skills updated successfully")
    );
})

// Upload resume
// Uses Cloudinary; saves resumeUrl on student; deletes local temp file in utils
export const uploadResume = asyncHandler(async(req,res)=>{
    const studentId = resolveStudentAuthId(req, req.params?.studentId);

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new apierror(400, "Invalid student ID");
    }

    if (!req.file) {
        throw new apierror(400, "No file uploaded");
    }

    if (!req.file.path || !req.file.filename) {
        throw new apierror(400, "Uploaded file is missing on server");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    const hasCloudinary = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    const localResumeUrl = `/temp/${req.file.filename}`;

    if (!hasCloudinary) {
        // Store local path served from /public
        student.resumeUrl = localResumeUrl;
    } else {
        // Upload to Cloudinary, fall back to local on any failure
        let resumeUpload = null;
        try {
            resumeUpload = await uploadoncloudinary(req.file.path);
        } catch (error) {
            resumeUpload = null;
        }

        if (!resumeUpload || !resumeUpload.url) {
            student.resumeUrl = localResumeUrl;
        } else {
            student.resumeUrl = resumeUpload.url;
        }
    }
    await student.save();

    const updatedStudent = await User.findById(studentId).select("-password -refreshToken");
    const completion = evaluateStudentProfileCompletion(updatedStudent?.toObject?.() || updatedStudent || {});
    const responseData = {
        ...(updatedStudent?.toObject?.() || {}),
        isProfileComplete: completion.isComplete,
        missingProfileFields: completion.missingFields
    };

    return res.status(200).json(
        new apiResponse(200, responseData, "Resume uploaded successfully")
    );
})

// Verify student email with OTP
export const verifyEmail = asyncHandler(async(req,res)=>{
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new apierror(400, "Email and OTP are required");
    }

    const student = await User.findOne({ email: email.toLowerCase() });
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    if (student.isEmailVerified && !student.emailVerificationToken) {
        throw new apierror(400, "Email already verified");
    }

    // Check if OTP is correct and not expired
    if (student.emailVerificationToken !== otp) {
        throw new apierror(400, "Invalid OTP");
    }

    if (new Date() > student.emailVerificationTokenExpiry) {
        throw new apierror(400, "OTP has expired. Please register again.");
    }

    // Mark as verified
    student.isEmailVerified = true;
    student.emailVerificationToken = null;
    student.emailVerificationTokenExpiry = null;
    await student.save();

    const verifiedStudent = await User.findById(student._id).select("-password -refreshToken -emailVerificationToken");
    
    return res.status(200).json(
        new apiResponse(200, verifiedStudent, "Email verified successfully! You can now login.")
    );
})

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
    const { enrollmentNo, otp } = req.body;

    if (!enrollmentNo || !otp) {
        throw new apierror(400, "Enrollment number and OTP are required");
    }

    const normalizedEnrollment = String(enrollmentNo).trim().toUpperCase();
    const student = await User.findOne({ enrollmentNo: normalizedEnrollment });

    if (!student) {
        throw new apierror(404, "Student not found");
    }

    if (!student.emailVerificationToken || student.emailVerificationToken !== String(otp).trim()) {
        throw new apierror(400, "Invalid OTP");
    }

    if (!student.emailVerificationTokenExpiry || new Date() > student.emailVerificationTokenExpiry) {
        throw new apierror(400, "OTP has expired. Please register again.");
    }

    student.isEmailVerified = true;
    student.emailVerificationToken = null;
    student.emailVerificationTokenExpiry = null;

    await student.save();

    const masterStudent = await StudentMaster.findOne({ enrollmentNo: normalizedEnrollment });
    if (masterStudent) {
        masterStudent.isClaimed = true;
        masterStudent.claimedBy = student._id;
        masterStudent.claimedAt = new Date();
        await masterStudent.save();
    }

    return res.status(200).json(
        new apiResponse(200, { enrollmentNo: normalizedEnrollment }, "Verified successfully! You can now login.")
    );
});

// Forgot Password - Send reset token via email
export const forgotPassword = asyncHandler(async(req,res)=>{
    const { email, role } = req.body;

    if (!email || !role) {
        throw new apierror(400, "Email and role are required");
    }

    let user;
    if (role === 'student') {
        user = await User.findOne({ email: email.toLowerCase() });
    } else if (role === 'company') {
        user = await Company.findOne({ email: email.toLowerCase() });
    } else {
        throw new apierror(400, "Invalid role. Must be 'student' or 'company'");
    }

    if (!user) {
        throw new apierror(404, "User not found with this email");
    }

    // Generate reset token (6-digit OTP)
    const resetToken = generateOTP();
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Critical path: reset OTP email must be delivered.
    try {
        await sendPasswordResetEmail(email.toLowerCase(), resetToken, user.fullname || user.companyName);
    } catch (emailError) {
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiry = null;
        await user.save();
        throw new apierror(502, "Unable to send reset OTP email. Please try again.");
    }

    return res.status(200).json(
        new apiResponse(200, { email: email.toLowerCase() }, "Password reset OTP sent to your email. Valid for 15 minutes.")
    );
})

// Reset Password - Verify token and update password
export const resetPassword = asyncHandler(async(req,res)=>{
    const { email, otp, newPassword, role } = req.body;

    if (!email || !otp || !newPassword || !role) {
        throw new apierror(400, "Email, OTP, new password, and role are required");
    }

    if (newPassword.length < 6) {
        throw new apierror(400, "Password must be at least 6 characters long");
    }

    let user;
    if (role === 'student') {
        user = await User.findOne({ email: email.toLowerCase() });
    } else if (role === 'company') {
        user = await Company.findOne({ email: email.toLowerCase() });
    } else {
        throw new apierror(400, "Invalid role. Must be 'student' or 'company'");
    }

    if (!user) {
        throw new apierror(404, "User not found");
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== otp) {
        throw new apierror(400, "Invalid OTP");
    }

    if (new Date() > user.resetPasswordTokenExpiry) {
        throw new apierror(400, "OTP has expired. Please request a new one.");
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    return res.status(200).json(
        new apiResponse(200, null, "Password reset successfully! You can now login with your new password.")
    );
})

