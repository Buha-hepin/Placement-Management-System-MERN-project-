import mongoose from "mongoose";

const { Schema } = mongoose;

const placementMaterialSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        category: {
            type: String,
            default: "General",
            trim: true
        },
        fileName: {
            type: String,
            required: true,
            trim: true
        },
        fileUrl: {
            type: String,
            required: true,
            trim: true
        },
        mimeType: {
            type: String,
            default: "application/octet-stream"
        },
        uploadedBy: {
            type: String,
            default: "admin"
        }
    },
    {
        timestamps: true
    }
);

export const PlacementMaterial = mongoose.models.PlacementMaterial || mongoose.model("PlacementMaterial", placementMaterialSchema);