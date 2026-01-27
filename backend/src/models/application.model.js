import mongoose from "mongoose";

const { Schema } = mongoose;

// Application: tracks a student's application to a job with a status
const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "selected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate applications for the same job by the same student
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);
