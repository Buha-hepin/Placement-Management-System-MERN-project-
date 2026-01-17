import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    
    companyName: {
        type: String,
        required: true
    },

    jobTitle: {
        type: String,
        required: true
    },

    jobDescription: {
        type: String,
        required: true
    },

    requirements: {
        type: [String],
        required: true
    },

    location: {
        type: String,
        required: true
    },

    salary: {
        type: String,
    },

    jobType: {
        type: String,
        enum: ["Full-time", "Internship", "Part-time"],
        default: "Full-time"
    },

    skills: {
        type: [String],
        required: true
    },

    minCGPA: {
        type: Number,
        default: 0
    },

    applicationDeadline: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    applicants: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },

    postedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

export const Job = mongoose.model("Job", jobSchema);
