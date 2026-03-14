import { PlacementMaterial } from "../models/placementMaterial.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";

export const getPlacementMaterials = asyncHandler(async (req, res) => {
    const materials = await PlacementMaterial.find({}).sort({ createdAt: -1 });

    return res.status(200).json(
        new apiResponse(200, materials, "Placement materials retrieved successfully")
    );
});

export const uploadPlacementMaterial = asyncHandler(async (req, res) => {
    const { title, description = "", category = "General" } = req.body;

    if (!title || !String(title).trim()) {
        throw new apierror(400, "Title is required");
    }

    if (!req.file) {
        throw new apierror(400, "Material file is required");
    }

    const material = await PlacementMaterial.create({
        title: String(title).trim(),
        description: String(description || "").trim(),
        category: String(category || "General").trim(),
        fileName: req.file.originalname,
        fileUrl: `/temp/${req.file.filename}`,
        mimeType: req.file.mimetype || "application/octet-stream",
        uploadedBy: "admin"
    });

    return res.status(201).json(
        new apiResponse(201, material, "Placement material uploaded successfully")
    );
});

export const deletePlacementMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;

    if (!materialId) {
        throw new apierror(400, "Material ID is required");
    }

    const material = await PlacementMaterial.findByIdAndDelete(materialId);
    if (!material) {
        throw new apierror(404, "Placement material not found");
    }

    return res.status(200).json(
        new apiResponse(200, {}, "Placement material deleted successfully")
    );
});