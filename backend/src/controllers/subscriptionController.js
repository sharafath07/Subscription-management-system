
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const subscriptionSchema = z.object({
    customerId: z.string().uuid(),
    planId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    nextBillingDate: z.coerce.date().optional().nullable(),
    quantity: z.coerce.number().int().positive().default(1),
    notes: z.string().trim().max(1000).optional().nullable()
});

const updateSubscriptionSchema = z.object({
    planId: z.string().uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    nextBillingDate: z.coerce.date().optional().nullable(),
    quantity: z.coerce.number().int().positive().optional(),
    notes: z.string().trim().max(1000).optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update'
});

const subscriptionInclude = {
    customer: true,
    plan: {
        include: {
            product: true
        }
    },
    invoices: true
};

export const createSubscription = async (req, res) => {
    try {
        const result = subscriptionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription data',
                errors: result.error.flatten()
            });
        }

        const data = result.data;

        if (data.endDate && data.endDate < data.startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be before start date'
            });
        }

        const [customer, plan] = await Promise.all([
            prisma.customer.findUnique({
                where: { id: data.customerId }
            }),
            prisma.plan.findUnique({
                where: { id: data.planId },
                include: { product: true }
            })
        ]);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!plan || !plan.isActive || !plan.product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Active plan not found'
            });
        }

        const subscription = await prisma.subscription.create({
            data: {
                ...data,
                status: 'DRAFT'
            },
            include: subscriptionInclude
        });

        return res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create subscription'
        });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const { status, customerId, planId, search } = req.query;

        const validStatuses = [
            'DRAFT',
            'QUOTATION',
            'CONFIRMED',
            'ACTIVE',
            'CLOSED'
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription status'
            });
        }

        const where = {
            ...(status && { status }),
            ...(customerId && { customerId }),
            ...(planId && { planId }),
            ...(search && {
                OR: [
                    {
                        customer: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    },
                    {
                        plan: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    }
                ]
            })
        };

        const subscriptions = await prisma.subscription.findMany({
            where,
            include: subscriptionInclude,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve subscriptions'
        });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID'
            });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { id },
            include: subscriptionInclude
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve subscription'
        });
    }
};

export const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID'
            });
        }

        const result = updateSubscriptionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid update data',
                errors: result.error.flatten()
            });
        }

        const existing = await prisma.subscription.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (['CLOSED'].includes(existing.status)) {
            return res.status(400).json({
                success: false,
                message: 'Closed subscriptions cannot be updated'
            });
        }

        const data = result.data;

        const startDate = data.startDate ?? existing.startDate;
        const endDate = data.endDate === undefined
            ? existing.endDate
            : data.endDate;

        if (endDate && endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be before start date'
            });
        }

        if (data.planId) {
            const plan = await prisma.plan.findUnique({
                where: { id: data.planId },
                include: { product: true }
            });

            if (!plan || !plan.isActive || !plan.product.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Active plan not found'
                });
            }
        }

        const updated = await prisma.subscription.update({
            where: { id },
            data,
            include: subscriptionInclude
        });

        return res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update subscription'
        });
    }
};

export const updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const statusSchema = z.object({
            status: z.enum([
                'DRAFT',
                'QUOTATION',
                'CONFIRMED',
                'ACTIVE',
                'CLOSED'
            ])
        });

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID'
            });
        }

        const result = statusSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription status',
                errors: result.error.flatten()
            });
        }

        const existing = await prisma.subscription.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (existing.status === 'CLOSED' && result.data.status !== 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: 'A closed subscription cannot be reopened'
            });
        }

        const updated = await prisma.subscription.update({
            where: { id },
            data: { status: result.data.status },
            include: subscriptionInclude
        });

        return res.status(200).json({
            success: true,
            message: 'Subscription status updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Update subscription status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update subscription status'
        });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID'
            });
        }

        const existing = await prisma.subscription.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (existing.status === 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Active subscriptions cannot be deleted. Close them instead.'
            });
        }

        await prisma.subscription.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    } catch (error) {
        console.error('Delete subscription error:', error);

        if (error.code === 'P2003' || error.code === 'P2014') {
            return res.status(409).json({
                success: false,
                message: 'This subscription has related records and cannot be deleted'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to delete subscription'
        });
    }
};
