import { Router } from 'express';
import { fetchAndSaveData } from '../controllers/scrape.controller.js';

const router = Router();

router.get('/fetch-data-save', fetchAndSaveData);

export default router;