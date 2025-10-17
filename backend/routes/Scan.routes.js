import express from 'express';
import {startScan} from '../controllers/Scan.controller.js';

const router = express.Router();

router.post('/', startScan);

export default router;