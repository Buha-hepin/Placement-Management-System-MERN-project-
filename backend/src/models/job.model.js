// Job schema: describes a job posting created by a company
import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema({
    // Reference to company that posted the job
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    
    companyName: {
        type: String,
        required: true
    },

    // Human-readable title e.g. "Software Engineer"
    jobTitle: {
        type: String,
        required: true
    },

    jobDescription: {
        type: String,
        required: true
    },

    // Plain text bullet points
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

    // Enum ensures consistent values for filtering
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

    // Moderation status
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
