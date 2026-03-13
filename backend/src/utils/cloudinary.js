import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isConfiguredValue = (value) => {
    if (typeof value !== 'string') {
        return Boolean(value);
    }

    const normalized = value.trim().toLowerCase();
    return Boolean(normalized) && !['undefined', 'null', 'your_api_key', 'your_api_secret', 'your_cloud_name'].includes(normalized);
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


    // Upload a local file to Cloudinary.
    // Always deletes local temp file on success/failure to avoid disk bloat.
    const uploadoncloudinary = async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }

        const hasCloudinary = [
            process.env.CLOUDINARY_CLOUD_NAME,
            process.env.CLOUDINARY_API_KEY,
            process.env.CLOUDINARY_API_SECRET
        ].every(isConfiguredValue);

        if (!hasCloudinary) {
            // Fallback to local static file when Cloudinary is not configured.
            const filename = path.basename(filePath);
            return { url: `/temp/${filename}`, local: true };
        }

        const ext = path.extname(filePath).toLowerCase();
        const isDoc = ext === '.pdf' || ext === '.doc' || ext === '.docx';

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: isDoc ? 'raw' : 'auto'
        });

        // Delete file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return response;
        } catch (error) {
            // Cloudinary upload failed — fall back to serving the file locally.
            console.error('Error uploading to Cloudinary:', error.message || error);
            const filename = path.basename(filePath);
            return { url: `/temp/${filename}`, local: true };
        }
};

    export {uploadoncloudinary};