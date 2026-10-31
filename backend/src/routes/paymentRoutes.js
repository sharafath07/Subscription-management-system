
import express from 'express';

import {
    createPayment,
    getPayments,
    getPaymentById
} from '../controllers/paymentController.js';

import {
    protect,
    authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.post('/', createPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);

export default router;
