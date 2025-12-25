import {router} from 'express';
import {registeruser} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';

const router=router;

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },//first file
        { name: 'coverImage', maxCount: 1 }//second file
    ]),
    registeruser
)

export default router