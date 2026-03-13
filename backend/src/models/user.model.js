import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const semesterAcademicSchema = new Schema({
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    spi: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    cpi: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    backlogCount: {
        type: Number,
        min: 0,
        default: 0
    },
    backlogSubjects: {
        type: [String],
        default: []
    }
}, { _id: false });
    
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname:{
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

    enrollmentNo:{
        type: String,
        required: [true, "Enrollment number is required"],
        unique: true,
        index: true,
        trim: true
    },

    branch:{
        type: String,
    },

    cgpa:{
        type: Number,
        min: 0,
        max: 10,
    },

    phone:{
        type: String,
    },

    skills:{
        type: [String],
    },

    resumeUrl:{
        type: String,
    },

    semesterAcademicRecords: {
        type: [semesterAcademicSchema],
        default: []
    },

    adminAcademicRecords: {
        type: [semesterAcademicSchema],
        default: []
    },

    academicVerification: {
        hasMismatch: {
            type: Boolean,
            default: false
        },
        mismatchCount: {
            type: Number,
            default: 0
        },
        mismatchSemesters: {
            type: [Number],
            default: []
        },
        mismatchDetails: {
            type: [Schema.Types.Mixed],
            default: []
        },
        lastComparedAt: {
            type: Date,
            default: null
        }
    },

    placed:{
        type: Boolean,
        default: false  
    },

    noShowCount: {
        type: Number,
        default: 0
    },

    isPlacementBlocked: {
        type: Boolean,
        default: false
    },

    placementBlockedAt: {
        type: Date,
        default: null
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: {
        type: String,
        default: null
    },

    emailVerificationTokenExpiry: {
        type: Date,
        default: null
    },

    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordTokenExpiry: {
        type: Date,
        default: null
    },

    refreshToken: {
        type: String,
    },
},
{
    timestamps: true
})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) { 
        return next();
    }   
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.IsPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Backwards-compatible method name expected by controllers
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
} 

// //genarate access token and refresh token
// userSchema.methods.generateAccessToken = function() {
//     return jwt.sign(
//         { id: this._id,
//           enrollmentNo: this.enrollmentNo,
//           email: this.email,
//           fullname: this.fullname,
//         }, 
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//              expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
//         }
//     );
// }

// //same as for refresh token
// userSchema.methods.generateRefreshToken = function() {
//     return jwt.sign(
//         { 
//             id: this._id ,
//         }, 
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//              expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
//         }
//     );
// }

export const User = mongoose.models.User || mongoose.model("User", userSchema); 