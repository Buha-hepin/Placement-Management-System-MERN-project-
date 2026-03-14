import mongoose from "mongoose";

const { Schema } = mongoose;

const studentMasterSchema = new Schema(
    {
        enrollmentNo: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            uppercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            default: null,
            trim: true,
            lowercase: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isClaimed: {
            type: Boolean,
            default: false
        },
        claimedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        claimedAt: {
            type: Date,
            default: null
        },
        registrationOtp: {
            type: String,
            default: null
        },
        registrationOtpExpiry: {
            type: Date,
            default: null
        },
        registrationOtpVerifiedAt: {
            type: Date,
            default: null
        },
        registrationOtpAttempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const StudentMaster =
    mongoose.models.StudentMaster || mongoose.model("StudentMaster", studentMasterSchema);
