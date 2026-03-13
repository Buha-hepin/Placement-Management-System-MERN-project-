import mongoose from "mongoose";

const { Schema } = mongoose;

const aptitudeTestSchema = new Schema({
    // Reference to company that created the test
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    companyName: {
        type: String,
        required: true
    },

    // Optional: link to a specific job
    jobId: {
        type: Schema.Types.ObjectId,
        ref: "Job",
        default: null
    },

    jobTitle: {
        type: String,
        default: null
    },

    // Test metadata
    testName: {
        type: String,
        required: true
    },

    testDescription: {
        type: String,
        default: ""
    },

    // Time limit in minutes (e.g., 60, 90, 120)
    timeLimit: {
        type: Number,
        required: true,
        min: 5,
        max: 480 // Max 8 hours
    },

    // Number of questions (calculated from PDF pages)
    totalQuestions: {
        type: Number,
        required: true
    },

    // Question images array (from PDF conversion)
    questions: [
        {
            questionNumber: Number,
            imageUrl: {
                type: String,
                default: null // Optional if using PDF page rendering
            },
            pdfUrl: {
                type: String,
                default: null
            },
            pdfPageNumber: {
                type: Number,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // Answer key: array of correct answers (A, B, C, D)
    answerKey: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.every(ans => ['A', 'B', 'C', 'D'].includes(ans.toUpperCase()));
            },
            message: "Answer must be A, B, C, or D"
        }
    },

    // Scoring settings
    scoring: {
        totalMarks: {
            type: Number,
            required: true
        },
        marksPerQuestion: {
            type: Number,
            required: true
        },
        negativeMarking: {
            enabled: {
                type: Boolean,
                default: false
            },
            marksPerWrong: {
                type: Number,
                default: 0.5
            }
        },
        passingScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },

    // Test restrictions
    restrictions: {
        maxAttempts: {
            type: Number,
            default: 1,
            min: 1
        },
        tabSwitchLimit: {
            type: Number,
            default: 3,
            min: 1
        },
        shuffleQuestions: {
            type: Boolean,
            default: true
        },
        allowedBranches: {
            type: [String],
            default: []
        },
        minCGPA: {
            type: Number,
            default: 0
        }
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    isPublished: {
        type: Boolean,
        default: false
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
aptitudeTestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const AptitudeTest = mongoose.model("AptitudeTest", aptitudeTestSchema);
