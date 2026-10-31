import { prisma } from '../config/prisma.js';

// GET /api/customer/me
export const getMyProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: req.customer
        });
    } catch (error) {
        console.error('Get customer profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get customer profile'
        });
    }
};

// GET /api/customer/products
export const getCustomerProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get customer products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get products'
        });
    }
};

// GET /api/customer/plans
export const getCustomerPlans = async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            where: {
                isActive: true,
                product: {
                    isActive: true
                }
            },
            include: {
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        console.error('Get customer plans error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get plans'
        });
    }
};

// GET /api/customer/subscriptions
export const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: {
                customerId: req.customer.id
            },
            include: {
                plan: {
                    include: {
                        product: true
                    }
                },
                invoices: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error('Get customer subscriptions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get subscriptions'
        });
    }
};

// GET /api/customer/invoices
export const getMyInvoices = async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                customerId: req.customer.id
            },
            include: {
                subscription: {
                    include: {
                        plan: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                payments: true
            },
            orderBy: {
                issueDate: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get customer invoices error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get invoices'
        });
    }
};

// GET /api/customer/payments
export const getMyPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                invoice: {
                    customerId: req.customer.id
                }
            },
            include: {
                invoice: {
                    include: {
                        subscription: {
                            include: {
                                plan: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                paymentDate: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get customer payments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get payments'
        });
    }
};

// Calculate the next billing date using the plan's billing interval.
const calculateNextBillingDate = (startDate, billingInterval) => {
    const nextDate = new Date(startDate);

    switch (billingInterval) {
        case 'WEEKLY':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'MONTHLY':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'QUARTERLY':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
        case 'YEARLY':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            throw new Error('Invalid billing interval');
    }

    return nextDate;
};

// POST /api/customer/subscriptions
export const requestSubscription = async (req, res) => {
    try {
        const { planId, quantity = 1, notes } = req.body;

        if (!planId || typeof planId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'A valid planId is required'
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }

        const plan = await prisma.plan.findUnique({
            where: {
                id: planId
            },
            include: {
                product: true
            }
        });

        if (!plan || !plan.isActive || !plan.product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found or unavailable'
            });
        }

        const startDate = new Date();

        const nextBillingDate = calculateNextBillingDate(
            startDate,
            plan.billingInterval
        );

        const subscription = await prisma.subscription.create({
            data: {
                customerId: req.customer.id,
                planId: plan.id,
                startDate,
                nextBillingDate,
                quantity,
                notes: notes?.trim() || null
            },
            include: {
                plan: {
                    include: {
                        product: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Subscription request submitted successfully. Awaiting approval.',
            data: subscription
        });

    } catch (error) {
        console.error('Request subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit subscription request'
        });
    }
};