import mongoose from "mongoose";

const { Schema } = mongoose;

const testAttemptSchema = new Schema({
    // References
    testId: {
        type: Schema.Types.ObjectId,
        ref: "AptitudeTest",
        required: true
    },

    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    jobId: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        default: null
    },

    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    // Student answers: array with one entry per question
    // e.g., ["A", "B", null, "C"] — null means not answered
    studentAnswers: {
        type: [String],
        default: []
    },

    // Time tracking
    startTime: {
        type: Date,
        required: true
    },

    submitTime: {
        type: Date,
        default: null
    },

    // How was test submitted?
    // "completed" = student submitted normally
    // "timeout" = time ran out
    // "tab_switch" = 4th tab switch triggered auto-submit
    submitReason: {
        type: String,
        enum: ["completed", "timeout", "tab_switch", "abandoned"],
        default: "completed"
    },

    // Test attempt metadata
    attemptNumber: {
        type: Number,
        default: 1
    },

    tabSwitches: {
        type: Number,
        default: 0
    },

    // Scoring
    correctAnswers: {
        type: Number,
        default: 0
    },

    wrongAnswers: {
        type: Number,
        default: 0
    },

    unansweredCount: {
        type: Number,
        default: 0
    },

    // Final score and percentage
    score: {
        type: Number,
        default: 0
    },

    percentage: {
        type: Number,
        default: 0
    },

    passed: {
        type: Boolean,
        default: false
    },

    // Test status
    status: {
        type: String,
        enum: ["ongoing", "submitted", "evaluated"],
        default: "ongoing"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
testAttemptSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Compound index to ensure one attempt per student per test
testAttemptSchema.index({ testId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

export const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
