
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const planSchema = z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    price: z.coerce.number().positive().max(9999999999.99),
    billingInterval: z.enum([
        'WEEKLY',
        'MONTHLY',
        'QUARTERLY',
        'YEARLY'
    ]),
    trialDays: z.coerce.number().int().min(0).max(365).default(0),
    productId: z.string().uuid()
});

export const createPlan = async (req, res) => {
    try {
        const result = planSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: result.data.productId
            }
        });

        if (!product || !product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Active product not found'
            });
        }

        const plan = await prisma.plan.create({
            data: result.data,
            include: {
                product: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            plan
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create plan'
        });
    }
};

// GET ALL PLANS

export const getPlans = async (req, res) => {
    try {
        const { productId, search, active } = req.query;

        const plans = await prisma.plan.findMany({
            where: {
                ...(productId && { productId }),
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
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            count: plans.length,
            plans
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch plans'
        });
    }
};

// GET SINGLE PLAN

export const getPlanById = async (req, res) => {
    try {
        const plan = await prisma.plan.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                product: true
            }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            plan
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch plan'
        });
    }
};

// UPDATE PLAN

export const updatePlan = async (req, res) => {
    try {
        const result = planSchema.partial().safeParse(req.body);

        if (!result.success || Object.keys(result.data || {}).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Provide valid plan details',
                errors: result.success ? undefined : result.error.flatten().fieldErrors
            });
        }

        if (result.data.productId) {
            const product = await prisma.product.findUnique({
                where: {
                    id: result.data.productId
                }
            });

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Active product not found'
                });
            }
        }

        const plan = await prisma.plan.update({
            where: {
                id: req.params.id
            },
            data: result.data,
            include: {
                product: true
            }
        });

        res.json({
            success: true,
            message: 'Plan updated successfully',
            plan
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update plan'
        });
    }
};

// DEACTIVATE PLAN

export const deletePlan = async (req, res) => {
    try {
        await prisma.plan.update({
            where: {
                id: req.params.id
            },
            data: {
                isActive: false
            }
        });

        res.json({
            success: true,
            message: 'Plan deactivated successfully'
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate plan'
        });
    }
};
