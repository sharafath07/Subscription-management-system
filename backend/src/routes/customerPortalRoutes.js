import express from 'express';

import {
    getMyProfile,
    getCustomerProducts,
    getCustomerPlans,
    getMySubscriptions,
    getMyInvoices,
    getMyPayments,
    requestSubscription
} from '../controllers/customerPortalController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { requireCustomerProfile } from '../middleware/customerPortalMiddleware.js';

const router = express.Router();

// All Customer Portal routes require CUSTOMER authentication.
router.use(
    protect,
    authorize('CUSTOMER'),
    requireCustomerProfile
);

router.get('/me', getMyProfile);
router.get('/products', getCustomerProducts);
router.get('/plans', getCustomerPlans);
router.get('/subscriptions', getMySubscriptions);
router.get('/invoices', getMyInvoices);
router.get('/payments', getMyPayments);

router.post('/subscriptions', requestSubscription);

export default router;