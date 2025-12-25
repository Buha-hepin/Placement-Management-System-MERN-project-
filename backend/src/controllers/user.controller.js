import asynchandler from "express-async-handler";
import{apierror} from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import{uploadoncloudinary} from "../utils/cloudinary.js";
import{ apiResponse } from "../utils/apiResponse.js";   


const rejisterUser = asynchandler(async(req,res)=>{
    //get user data from frontend
      const {fullname,email,username,password} =req.body
    console.log("email",email);


    //validation for all fields---not empty
    if([fullname,email,username,password].some(()=>
        field?.trim() === '')
    ){
        throw new apierror(400,"All fields are required");
    }
    


    //check if user already exists----username or email
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new apierror(400,"User already exists");
    }



    //check for images and avatar
    const localPath= req.file?.avatar[0]?.path
    const coverImagePath = req.file?.coverImage[0]?.path
    if(avatarPath ){
        throw new apierror(400,"Cover image is required");
    }



    //upload then to cloudinary----check avatar
    const avatar =await uploadoncloudinary(localPath);
    const coverImage = await uploadoncloudinary(coverImagePath);
    if(!avatar){
        throw new apierror(400,"Image upload failed");
    }


    //create user object----entry in db
    const user=await username.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url ||"",
        email,
        username: username.tolovercase(),
        password
    })


    //remove password and refresh token from response
     //check for user creation
    const createdUser = await user.findById(user._id).select("-password -refreshToken");// Exclude password and refreshToken from the response
    if(!createdUser){
        throw new apierror(500,"User creation failed");
    }
    
   
    //return response
    return res.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully")
    )
  


})


export { rejisterUser };