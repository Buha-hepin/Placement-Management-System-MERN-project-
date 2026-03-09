import { Router } from 'express';
// Company routes: profile read/update, jobs create/list/edit/delete
import { fetchCompanyDetails, editCompanyDetails, postJob, fetchJobsByCompany, editCompanyJob, deleteCompanyJob } from '../controllers/company.controller.js';

const router = Router();

// Company profile routes
router.route('/:id').get(fetchCompanyDetails);
router.route('/:id').put(editCompanyDetails);

// Company job routes
router.route('/:id/jobs').post(postJob);
router.route('/:id/jobs').get(fetchJobsByCompany);
router.route('/:id/jobs/:jobId').put(editCompanyJob);
router.route('/:id/jobs/:jobId').delete(deleteCompanyJob);

export default router;
