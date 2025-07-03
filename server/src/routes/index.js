import { Router } from 'express';
import dataRoutes from './data.routes.js';
import scrapeRoutes from './scrape.routes.js';

const router = Router();

router.use('/api', dataRoutes);
router.use('/api', scrapeRoutes);

export default router;