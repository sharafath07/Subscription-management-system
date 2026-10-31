
import express from 'express';

import {
    createPlan,
    getPlans,
    getPlanById,
    updatePlan,
    deletePlan
} from '../controllers/planController.js';

import {
    protect,
    authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.post('/', createPlan);
router.get('/', getPlans);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;
