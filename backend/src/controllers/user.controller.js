import { asyncHandler } from "../utils/asynchandler.js";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import{ apiResponse } from "../utils/apiResponse.js";   


 export const registerUser = asyncHandler(async(req,res)=>{
    console.log("req.body",req.body);


    
    // //get user data from frontend
    //   const {fullname,email,username,password} =req.body
    // console.log("email",email);


    // // validation for all fields---not empty
    // if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    //     throw new apierror(400, "All fields are required");
    // }
    


    // //check if user already exists----username or email
    // const existedUser = await User.findOne({
    //     $or:[{username},{email}]
    // })
    // if(existedUser){
    //     throw new apierror(400,"User already exists");
    // }



    // // check for images and avatar
    // const avatarPath = req.files?.avatar?.[0]?.path;
    // const coverImagePath = req.files?.coverImage?.[0]?.path;
    // if (!avatarPath || !coverImagePath) {
    //     throw new apierror(400, "Both avatar and cover image are required");
    // }



    // // upload them to cloudinary----check avatar
    // const avatar = await uploadoncloudinary(avatarPath);
    // const coverImage = await uploadoncloudinary(coverImagePath);
    // if (!avatar) {
    //     throw new apierror(400, "Image upload failed");
    // }


    // // create user object----entry in db
    // const user = await User.create({
    //     fullname,
    //     avatar: avatar.url,
    //     coverImage: coverImage?.url || "",
    //     email,
    //     username: username.toLowerCase(),
    //     password,
    // });


    // // check for user creation and remove sensitive fields
    // const createdUser = await User.findById(user._id).select("-password -refreshToken"); // Exclude password and refreshToken from the response
    // if (!createdUser) {
    //     throw new apierror(500, "User creation failed");
    // }
    
   
    // //return response
    // return res.status(201).json(
    //     new apiResponse(201, createdUser, "User registered successfully")
    // )
  


})


