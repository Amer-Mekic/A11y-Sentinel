import express from 'express';
import {startScan} from '../controllers/Scan.controller.js';
import {authenticateToken} from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', startScan);

export default router;