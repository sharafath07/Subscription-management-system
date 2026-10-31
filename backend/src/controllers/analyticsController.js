
import { prisma } from '../config/prisma.js';

export const getDashboard = async (req, res) => {
    try {
        const [
            totalCustomers,
            totalProducts,
            totalPlans,
            activeSubscriptions,
            totalSubscriptions,
            totalInvoices,
            revenueResult,
            outstandingInvoices,
            recentPayments
        ] = await Promise.all([
            prisma.customer.count(),

            prisma.product.count({
                where: { isActive: true }
            }),

            prisma.plan.count({
                where: { isActive: true }
            }),

            prisma.subscription.count({
                where: { status: 'ACTIVE' }
            }),

            prisma.subscription.count(),

            prisma.invoice.count(),

            prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),

            prisma.invoice.findMany({
                where: {
                    status: { not: 'VOID' }
                },
                select: {
                    total: true,
                    amountPaid: true
                }
            }),

            prisma.payment.findMany({
                take: 5,
                orderBy: { paymentDate: 'desc' },
                include: {
                    invoice: {
                        include: {
                            customer: true
                        }
                    }
                }
            })
        ]);

        const totalRevenue = Number(
            revenueResult._sum.amount ?? 0
        );

        const pendingRevenue = outstandingInvoices.reduce(
            (sum, invoice) => {
                return sum + Math.max(
                    0,
                    Number(invoice.total) - Number(invoice.amountPaid)
                );
            },
            0
        );

        return res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                totalProducts,
                totalPlans,
                activeSubscriptions,
                totalSubscriptions,
                totalInvoices,
                totalRevenue: Number(totalRevenue.toFixed(2)),
                pendingRevenue: Number(pendingRevenue.toFixed(2)),
                recentPayments
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard analytics'
        });
    }
};

export const getRevenueSummary = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED'
            },
            select: {
                amount: true,
                paymentDate: true
            },
            orderBy: {
                paymentDate: 'asc'
            }
        });

        const monthlyRevenue = {};

        for (const payment of payments) {
            const date = new Date(payment.paymentDate);

            const monthKey = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0')
            ].join('-');

            monthlyRevenue[monthKey] =
                (monthlyRevenue[monthKey] || 0) + Number(payment.amount);
        }

        const revenue = Object.entries(monthlyRevenue).map(
            ([month, amount]) => ({
                month,
                revenue: Number(amount.toFixed(2))
            })
        );

        const totalRevenue = payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
        );

        return res.status(200).json({
            success: true,
            data: {
                totalRevenue: Number(totalRevenue.toFixed(2)),
                monthlyRevenue: revenue
            }
        });
    } catch (error) {
        console.error('Revenue summary error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve revenue summary'
        });
    }
};

export const getRecentPayments = async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
            50
        );

        const payments = await prisma.payment.findMany({
            take: limit,
            orderBy: {
                paymentDate: 'desc'
            },
            include: {
                invoice: {
                    include: {
                        customer: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Recent payments error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve recent payments'
        });
    }
};
