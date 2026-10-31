
import express from 'express';

import {
    getDashboard,
    getRevenueSummary,
    getRecentPayments
} from '../controllers/analyticsController.js';

import {
    protect,
    authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.get('/dashboard', getDashboard);
router.get('/revenue', getRevenueSummary);
router.get('/recent-payments', getRecentPayments);

export default router;
