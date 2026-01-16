import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { loginUser } from '../controllers/user.controller.js';
import { fetchCompanyDetails } from '../controllers/company.controller.js';
import { editCcompanyDetails } from '../controllers/company.controller.js'; 
import { postJob } from '../controllers/company.controller.js';
import { fetchJobsByCompany } from '../controllers/company.controller.js';  

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

//company
router.route('/companyDetails/:id').get(fetchCompanyDetails);
router.route('/editCompanyDetails/:id').post(editCcompanyDetails)
router.route('/postjob/:id').post(postJob)
router.route('/fetchjobs/:id').get(fetchJobsByCompany)


export default router