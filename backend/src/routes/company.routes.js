import { Router } from 'express';
// Company routes: profile read/update, jobs create/list
import { fetchCompanyDetails, editCompanyDetails, postJob, fetchJobsByCompany } from '../controllers/company.controller.js';

const router = Router();

// Company profile routes
router.route('/:id').get(fetchCompanyDetails);
router.route('/:id').put(editCompanyDetails);

// Company job routes
router.route('/:id/jobs').post(postJob);
router.route('/:id/jobs').get(fetchJobsByCompany);

export default router;
