import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "./user.model.js"; 

const { Schema } = mongoose;

const jobPostingsSchema = new Schema({
    jobRole: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true, 
    },
    salaryPackage: {
        type:String,
        required: true,
    },
    jobtype: {
        type: String,
        enum: ['Full-time', 'Contract', 'Internship', ],
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    
    status :{
        type:String,
        enum:['draft','pending','publish'],
        default:false,
    },
    applicants: [
        {
           type: Schema.Types.ObjectId,
           ref: "User",
        } 
    ],  
});

const companySchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    companyName:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    
   
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },

    location:{
        type: String,
    },
    jobPostings: [
        {
           type: Schema.Types.ObjectId,
           ref: "Job",
        } 
    ],

    about:{
        type: String,
        default: "",
    },

    refreshToken: {
        type: String,
    },
},
{
    timestamps: true
})

companySchema.pre("save", async function(next) {
    if (!this.isModified("password")) { 
        return next();
    }   
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

companySchema.methods.IsPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Backwards-compatible method name expected by controllers
companySchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

//genarate access token and refresh token
companySchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { id: this._id,
          companyName: this.companyName,
          email: this.email,
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    );
}

//same as for refresh token
companySchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { 
            id: this._id ,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    );
}

export const Company = mongoose.models.Company || mongoose.model("Company", companySchema);  