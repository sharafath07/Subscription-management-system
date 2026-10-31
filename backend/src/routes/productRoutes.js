
import express from 'express';

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

import {
    protect,
    authorize
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN', 'STAFF'));

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
