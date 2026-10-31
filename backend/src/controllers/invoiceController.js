
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';

const invoiceSchema = z.object({
    customerId: z.string().uuid(),
    subscriptionId: z.string().uuid().optional().nullable(),
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date(),
    taxRate: z.coerce.number().min(0).max(100).default(0),
    discountAmount: z.coerce.number().min(0).default(0)
});

const statusSchema = z.object({
    status: z.enum([
        'DRAFT',
        'SENT',
        'OVERDUE',
        'VOID'
    ])
});

const invoiceInclude = {
    customer: true,
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
};

const calculateAmounts = (price, taxRate, discountAmount) => {
    const subtotal = Number(price);
    const taxAmount = subtotal * taxRate / 100;
    const total = Math.max(0, subtotal + taxAmount - discountAmount);

    return {
        subtotal: subtotal.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        total: total.toFixed(2)
    };
};

const generateInvoiceNumber = () => {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
    const uniquePart = randomUUID().slice(0, 8).toUpperCase();

    return `INV-${datePart}-${uniquePart}`;
};

export const createInvoice = async (req, res) => {
    try {
        const result = invoiceSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice data',
                errors: result.error.flatten()
            });
        }

        const data = result.data;

        if (data.dueDate < (data.issueDate ?? new Date())) {
            return res.status(400).json({
                success: false,
                message: 'Due date cannot be before issue date'
            });
        }

        const customer = await prisma.customer.findUnique({
            where: { id: data.customerId }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        let subscription = null;

        if (data.subscriptionId) {
            subscription = await prisma.subscription.findUnique({
                where: { id: data.subscriptionId },
                include: { plan: true }
            });

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscription not found'
                });
            }

            if (subscription.customerId !== data.customerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Subscription does not belong to this customer'
                });
            }
        }

        const subtotal = subscription
            ? Number(subscription.plan.price) * subscription.quantity
            : 0;

        const amounts = calculateAmounts(
            subtotal,
            data.taxRate,
            data.discountAmount
        );

        if (Number(amounts.total) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice total'
            });
        }

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(),
                customerId: data.customerId,
                subscriptionId: data.subscriptionId ?? null,
                issueDate: data.issueDate ?? new Date(),
                dueDate: data.dueDate,
                ...amounts,
                amountPaid: '0.00',
                status: 'DRAFT'
            },
            include: invoiceInclude
        });

        return res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: invoice
        });
    } catch (error) {
        console.error('Create invoice error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create invoice'
        });
    }
};

export const generateInvoiceFromSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        if (!z.string().uuid().safeParse(subscriptionId).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID'
            });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                customer: true,
                plan: true
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (!['CONFIRMED', 'ACTIVE'].includes(subscription.status)) {
            return res.status(400).json({
                success: false,
                message: 'Only confirmed or active subscriptions can generate invoices'
            });
        }

        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                subscriptionId,
                status: { not: 'VOID' }
            }
        });

        if (existingInvoice) {
            return res.status(409).json({
                success: false,
                message: 'An invoice already exists for this subscription',
                data: existingInvoice
            });
        }

        const subtotal = Number(subscription.plan.price) * subscription.quantity;
        const amounts = calculateAmounts(subtotal, 0, 0);
        const issueDate = new Date();
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 7);

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(),
                customerId: subscription.customerId,
                subscriptionId,
                issueDate,
                dueDate,
                ...amounts,
                amountPaid: '0.00',
                status: 'SENT'
            },
            include: invoiceInclude
        });

        return res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoice
        });
    } catch (error) {
        console.error('Generate invoice error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to generate invoice'
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { status, customerId, search } = req.query;

        const validStatuses = [
            'DRAFT',
            'SENT',
            'PARTIALLY_PAID',
            'PAID',
            'OVERDUE',
            'VOID'
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice status'
            });
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                ...(status && { status }),
                ...(customerId && { customerId }),
                ...(search && {
                    OR: [
                        {
                            invoiceNumber: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        },
                        {
                            customer: {
                                name: {
                                    contains: search,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    ]
                })
            },
            include: invoiceInclude,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error('Get invoices error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve invoices'
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID'
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: invoiceInclude
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve invoice'
        });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID'
            });
        }

        const result = statusSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice status',
                errors: result.error.flatten()
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { payments: true }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (invoice.status === 'PAID' || invoice.status === 'PARTIALLY_PAID') {
            return res.status(400).json({
                success: false,
                message: 'Payment-related invoice statuses are managed by the payment module'
            });
        }

        if (invoice.status === 'VOID' && result.data.status !== 'VOID') {
            return res.status(400).json({
                success: false,
                message: 'A void invoice cannot be reopened'
            });
        }

        const updated = await prisma.invoice.update({
            where: { id },
            data: { status: result.data.status },
            include: invoiceInclude
        });

        return res.status(200).json({
            success: true,
            message: 'Invoice status updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Update invoice status error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update invoice status'
        });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID'
            });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { payments: true }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (invoice.status !== 'DRAFT' || invoice.payments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Only unpaid draft invoices without payments can be deleted'
            });
        }

        await prisma.invoice.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Delete invoice error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete invoice'
        });
    }
};
