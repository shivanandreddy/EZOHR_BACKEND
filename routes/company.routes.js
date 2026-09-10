import express from 'express';
import {addCompany, getAllCompanies} from '../controllers/company.controller.js';

const router = express.Router();

router.post('/', addCompany);
router.get('/', getAllCompanies);

export default router;