import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async(req, res) => {
    const { role } = req.body;

    if (role === "student") {
        try {
            const { enrollmentNo, fullName, email, password, branch, skills, resumeUrl } = req.body;

            // Ensure required fields are present and non-empty
            if (![enrollmentNo, fullName, email, password].every(field => typeof field === 'string' && field.trim().length > 0)) {
                throw new apierror(400, "All fields are required");
            }

            // Check for existing user
            const existedUser = await User.findOne({ $or: [{ enrollmentNo }, { email }] });
            if (existedUser) {
                throw new apierror(400, "User already exists");
            }

            const user = await User.create({
                enrollmentNo,
                fullname: fullName,
                email,
                password,
                branch,
                skills,
                resumeUrl
            });

            const createdUser = await User.findById(user._id).select("-password -refreshToken");
            if (!createdUser) {
                throw new apierror(500, "User creation failed");
            }

            return res.status(201).json(new apiResponse(201, createdUser, "Student registered successfully"));
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

            const existedCompany = await Company.findOne({ $or: [{ companyName }, { email }] });
            if (existedCompany) {
                throw new apierror(400, "Company already exists");
            }

            const company = await Company.create({
                companyName,
                email,
                password,
                location: Location
            });

            const createdCompany = await Company.findById(company._id).select("-password -refreshToken");
            if (!createdCompany) {
                throw new apierror(500, "Company creation failed");
            }

            return res.status(201).json(new apiResponse(201, createdCompany, "Company registered successfully"));
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

export const loginUser = asyncHandler(async(req, res) => {
    const { role } = req.body;

    if (role === "student") {
        const { enrollmentNo, password } = req.body;
        if ([enrollmentNo, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }

        const user = await User.findOne({ enrollmentNo });
        if (!user || !(await user.comparePassword(password))) {
            throw new apierror(401, "Invalid enrollment number or password");
        }

        const userData = await User.findById(user._id).select("-password -refreshToken");

        return res.status(200).json(
            new apiResponse(200, userData, "Student logged in successfully")
        )
    }
    if (role === "company") {
        const { email, password } = req.body;
        if ([email, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }

        const company = await Company.findOne({ email });
        if (!company || !(await company.comparePassword(password))) {
            throw new apierror(401, "Invalid email or password");
        }
        const companyData = await Company.findById(company._id).select("-password -refreshToken");

        return res.status(200).json(
            new apiResponse(200, companyData, "Company logged in successfully")
        )
    }
    if (role === "admin") {
        const { email, password } = req.body;
        console.log('Admin login attempt with email:', email);
        console.log('Admin login attempt with password:', password);
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (email !== adminEmail || password !== adminPassword) {
            throw new apierror(401, "we are not getting your credentials right plaease try again");
        }
        const adminData = {
            email: adminEmail,
            role: "admin"
        };
        return res.status(200).json(
            new apiResponse(200, adminData, "Admin logged in successfully")
        )
    }
})

// === YAHAN SE TERA CODE START HOTA HAI (MERGED) ===

// Get student profile by ID
export const getStudentProfile = asyncHandler(async(req, res) => {
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
export const updateStudentProfile = asyncHandler(async(req, res) => {
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
    
    // CGPA FIX: 0 value handle karne ke liye
    if (cgpa !== undefined) student.cgpa = cgpa;
    
    if (phone) student.phone = phone;

    const updatedStudent = await student.save();
    const profileData = await User.findById(updatedStudent._id).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, profileData, "Student profile updated successfully")
    );
})

// Update student skills
export const updateStudentSkills = asyncHandler(async(req, res) => {
    const { studentId } = req.params;
    const { skills } = req.body;

    if (!studentId) {
        throw new apierror(400, "Student ID is required");
    }

    if (!skills || !Array.isArray(skills)) {
        throw new apierror(400, "Skills must be an array");
    }

    const student = await User.findByIdAndUpdate(
        studentId, { skills }, { new: true }
    ).select("-password -refreshToken");

    if (!student) {
        throw new apierror(404, "Student not found");
    }

    return res.status(200).json(
        new apiResponse(200, student, "Student skills updated successfully")
    );
})

// Upload resume
export const uploadResume = asyncHandler(async(req, res) => {
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

    student.resumeUrl = resumeUrl;
    await student.save();

    const updatedStudent = await User.findById(studentId).select("-password -refreshToken");

    return res.status(200).json(
        new apiResponse(200, updatedStudent, "Resume uploaded successfully")
    );
})