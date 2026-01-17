import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
       
    });


    // Upload a local file to Cloudinary.
    // Always deletes local temp file on success/failure to avoid disk bloat.
    const uploadoncloudinary = async (filePath) => {
        try {
            if(!filePath) { return null; }
            const response= await cloudinary.uploader.upload(filePath,
                {
                resource_type: 'auto',
                },
            )
            // Delete file after successful upload
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return response
           
        } catch (error) {
            // Delete the file if upload fails
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            console.error('Error uploading to Cloudinary:', error);
            return null;
        }
    }

    export {uploadoncloudinary};