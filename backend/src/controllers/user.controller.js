// User controller: student/company/admin auth and student profile ops
import { asyncHandler } from "../utils/asynchandler.js";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import{ apiResponse } from "../utils/apiResponse.js";
// import { sendOTPEmail } from "../utils/emailSender.js";
import crypto from "crypto";

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};   


// Register user
// role === 'student' or 'company' determines which model to use
export const registerUser = asyncHandler(async(req,res)=>{
    const {role} = req.body;

    if (role === "student") {
        try {
            const { enrollmentNo, fullName, email, password, branch, skills, resumeUrl } = req.body;

            // Ensure required fields are present and non-empty
            if (![enrollmentNo, fullName, email, password].every(field => typeof field === 'string' && field.trim().length > 0)) {
                throw new apierror(400, "All fields are required");
            }

            // Validate enrollment number format: YYBEBRANCHTTT##
            // Example: 23BEIT30055 (year-BE-branch-batch-student)
            const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;
            if (!enrollmentRegex.test(enrollmentNo.trim())) {
                throw new apierror(400, "Invalid enrollment number format. Expected format: YYBEBRANCHTTT## (e.g., 23BEIT30055)");
            }

            // Check for existing user by enrollment number (must be unique)
            const existingByEnrollment = await User.findOne({ enrollmentNo: enrollmentNo.trim().toUpperCase() });
            if (existingByEnrollment) {
                throw new apierror(400, "Enrollment number already registered. Please use a different enrollment number.");
            }
            
            // Also check email uniqueness
            const existingByEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingByEmail) {
                throw new apierror(400, "Email already registered. Please use a different email.");
            }

            const user = await User.create({
                enrollmentNo: enrollmentNo.trim().toUpperCase(),
                fullname: fullName,
                email: email.toLowerCase(),
                password,
                branch,
                skills,
                resumeUrl,
                isEmailVerified: false,
                emailVerificationToken: generateOTP(),
                emailVerificationTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            });

            const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken");
            if (!createdUser) {
                throw new apierror(500, "User creation failed");
            }

            // Send OTP email
            try {
                // await sendOTPEmail(email.toLowerCase(), user.emailVerificationToken, fullName);
                console.log(`📧 OTP for ${email}: ${user.emailVerificationToken}`);
            } catch (emailError) {
                console.error("Email sending failed:", emailError.message);
                // Even if email fails, registration succeeds but user sees warning
                // In production, you might want to retry or show error
            }

            return res.status(201).json(new apiResponse(201, createdUser, "Student registered successfully. Please verify your email with the OTP sent to your email address."));
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
    const {role} = req.body;    

    if(role==="student"){
        const {enrollmentNo,password} = req.body;
        if ([enrollmentNo, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }   

        const user = await User.findOne({enrollmentNo: enrollmentNo.trim().toUpperCase()});
        if(!user || !(await user.comparePassword(password))){
            throw new apierror(401,"Invalid enrollment number or password");
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            throw new apierror(403, "Please verify your email first. Check your inbox for the OTP.");
        }

        const userData = await User.findById(user._id).select("-password -refreshToken");
        return res.status(200).json(
            new apiResponse(200,userData,"Student logged in successfully")
        )
    }
    if(role==="company"){
        const {email,password} = req.body;  
        if ([email, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }   

        const company = await Company.findOne({email: email.toLowerCase()});
        if(!company || !(await company.comparePassword(password))){
            throw new apierror(401,"Invalid email or password");
        }
        const companyData = await Company.findById(company._id).select("-password -refreshToken");
        return res.status(200).json(
            new apiResponse(200,companyData,"Company logged in successfully")
        )
    }
    if(role==="admin"){
        const {email,password} = req.body;  
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if(email!==adminEmail || password!==adminPassword){
            throw new apierror(401,"Invalid admin credentials");
        }
        const adminData = {
            email:adminEmail,
            role:"admin"    
        };
        return res.status(200).json(
            new apiResponse(200,adminData,"Admin logged in successfully")
        )
    }
})

// Get student profile by ID
export const getStudentProfile = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findById(studentId).select("-password -refreshToken");
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    return res.status(200).json(
        new apiResponse(200, student, "Student profile retrieved successfully")
    );
})

// Update student profile
export const updateStudentProfile = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;
    const { fullname, email, branch, cgpa, phone } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    // Update only provided fields
    if (fullname) student.fullname = fullname;
    if (email) student.email = email;
    if (branch) student.branch = branch;
    if (cgpa) student.cgpa = cgpa;
    if (phone) student.phone = phone;

    const updatedStudent = await student.save();
    const profileData = await User.findById(updatedStudent._id).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, profileData, "Student profile updated successfully")
    );
})

// Update student skills (array)
export const updateStudentSkills = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;
    const { skills } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!skills || !Array.isArray(skills)) {
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

    return res.status(200).json(
        new apiResponse(200, student, "Student skills updated successfully")
    );
})

// Upload resume
// Uses Cloudinary; saves resumeUrl on student; deletes local temp file in utils
export const uploadResume = asyncHandler(async(req,res)=>{
    const { studentId } = req.params;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!req.file) {
        throw new apierror(400, "No file uploaded");
    }

    const student = await User.findById(studentId);
    if (!student) {
        throw new apierror(404, "Student not found");
    }

    // Upload to cloudinary
    const resumeUrl = await uploadoncloudinary(req.file.path);
    if (!resumeUrl) {
        throw new apierror(500, "Failed to upload resume");
    }

    student.resumeUrl = resumeUrl.url;
    await student.save();

    const updatedStudent = await User.findById(studentId).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, updatedStudent, "Resume uploaded successfully")
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

    if (student.isEmailVerified) {
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
