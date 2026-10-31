
import express from 'express';

import {
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    updateSubscriptionStatus,
    deleteSubscription
} from '../controllers/subscriptionController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.patch('/:id/status', updateSubscriptionStatus);
router.delete('/:id', deleteSubscription);

export default router;
