import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { apierror } from "../utils/apierror.js";
import {
    deletePlacementMaterial,
    getPlacementMaterials,
    uploadPlacementMaterial
} from "../controllers/placementMaterial.controller.js";

const router = Router();

const materialUpload = (req, res, next) => {
    upload.single("material")(req, res, (err) => {
        if (err) return next(new apierror(400, err.message || "Material upload failed"));
        return next();
    });
};

router.route("/").get(getPlacementMaterials);
router.route("/upload").post(materialUpload, uploadPlacementMaterial);
router.route("/:materialId").delete(deletePlacementMaterial);

export default router;