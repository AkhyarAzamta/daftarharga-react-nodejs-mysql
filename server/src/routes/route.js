import express from 'express';
import { getPaginatedData } from '../controllers/data.controller.js';
import { scrapeData } from '../controllers/scrape.controller.js';
import { exportCsv } from '../controllers/export.controller.js';
import { exportXlsx } from '../controllers/export.controller.js';


const router = express.Router();

router.get('/data', getPaginatedData);
router.post('/scrape', scrapeData);
router.get('/export/csv', exportCsv);
router.get('/export/xlsx', exportXlsx);

export default router;
