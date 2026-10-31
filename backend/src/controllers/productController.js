
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const productSchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional()
});

export const createProduct = async (req, res) => {
    try {
        const result = productSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors
            });
        }

        const product = await prisma.product.create({
            data: result.data
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
};

// GET ALL PRODUCTS

export const getProducts = async (req, res) => {
    try {
        const { search, active } = req.query;

        const products = await prisma.product.findMany({
            where: {
                ...(search && {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }),
                ...(active !== undefined && {
                    isActive: active === 'true'
                })
            },
            include: {
                plans: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

// GET SINGLE PRODUCT

export const getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                plans: true
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

// UPDATE PRODUCT

export const updateProduct = async (req, res) => {
    try {
        const result = productSchema.partial().safeParse(req.body);

        if (!result.success || Object.keys(result.data || {}).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Provide valid product details',
                errors: result.success ? undefined : result.error.flatten().fieldErrors
            });
        }

        const product = await prisma.product.update({
            where: {
                id: req.params.id
            },
            data: result.data
        });

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
};

// DEACTIVATE PRODUCT (SOFT DELETE)

export const deleteProduct = async (req, res) => {
    try {
        await prisma.product.update({
            where: {
                id: req.params.id
            },
            data: {
                isActive: false
            }
        });

        res.json({
            success: true,
            message: 'Product deactivated successfully'
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate product'
        });
    }
};
