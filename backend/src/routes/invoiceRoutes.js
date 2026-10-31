
import express from 'express';

import {
    createInvoice,
    generateInvoiceFromSubscription,
    getInvoices,
    getInvoiceById,
    updateInvoiceStatus,
    deleteInvoice
} from '../controllers/invoiceController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.post('/', createInvoice);
router.post('/generate/:subscriptionId', generateInvoiceFromSubscription);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.patch('/:id/status', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

export default router;
