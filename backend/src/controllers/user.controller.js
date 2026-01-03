import { asyncHandler } from "../utils/asynchandler.js";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import{ apiResponse } from "../utils/apiResponse.js";   


 export const registerUser = asyncHandler(async(req,res)=>{
    const {role} = req.body;

    if(role==="student"){
        try {
            const {enrollmentNo,fullName,email,password,branch,skills,resumeUrl} = req.body;
        if ([enrollmentNo, fullName, email, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }
        const existedUser = await User.findOne({
            $or:[{enrollmentNo},{email}]
        })  

        if(existedUser){
            throw new apierror(400,"User already exists");
            alert("User already exists");
        }   
        const user = await User.create({
            enrollmentNo,
            fullname:fullName,
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
        return res.status(201).json(
            new apiResponse(201, createdUser, "Student registered successfully")
        )
        } catch (error) {
            throw new apierror(500, "user controller error");
        }
    }

    if(role==="company"){
        const {companyName,email,password,Location} = req.body;
        if ([companyName, email, password].some((field) => field?.trim() === "")) {
            throw new apierror(400, "All fields are required");
        }

        const existedUser = await Company.findOne({
            $or:[{companyName},{email}]
        })      

        if(existedUser){
            throw new apierror(400,"Company already exists");
            alert("Company already exists");
        }   

        const user = await Company.create({
            companyName,
            email,
            password,
            location:Location
        });

        const createdUser = await Company.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new apierror(500, "Company creation failed");
        }   

        return res.status(201).json(
            new apiResponse(201, createdUser, "Company registered successfully")
        )
    }
    

})


