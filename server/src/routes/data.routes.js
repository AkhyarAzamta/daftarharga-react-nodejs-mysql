import { Router } from 'express';
import { fetchDataController } from '../controllers/data.controller.js';

const router = Router();

router.get('/fetch-data', fetchDataController);

export default router;