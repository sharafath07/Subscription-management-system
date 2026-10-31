
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const paymentSchema = z.object({
    invoiceId: z.string().uuid(),
    amount: z.coerce.number().positive(),
    method: z.enum([
        'CASH',
        'CARD',
        'BANK_TRANSFER',
        'UPI',
        'OTHER'
    ]),
    transactionId: z.string().trim().max(150).optional().nullable(),
    paymentDate: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional().nullable()
});

const paymentInclude = {
    invoice: {
        include: {
            customer: true,
            subscription: {
                include: {
                    plan: true
                }
            }
        }
    }
};

export const createPayment = async (req, res) => {
    try {
        const result = paymentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment data',
                errors: result.error.flatten()
            });
        }

        const data = result.data;

        // Process the payment and invoice update together.
        const payment = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: data.invoiceId }
            });

            if (!invoice) {
                const error = new Error('Invoice not found');
                error.statusCode = 404;
                throw error;
            }

            if (invoice.status === 'VOID') {
                const error = new Error('Cannot pay a void invoice');
                error.statusCode = 400;
                throw error;
            }

            const total = Number(invoice.total);
            const amountPaid = Number(invoice.amountPaid);
            const remaining = Number((total - amountPaid).toFixed(2));
            const paymentAmount = Number(data.amount.toFixed(2));

            if (paymentAmount > remaining) {
                const error = new Error(
                    `Payment exceeds remaining balance of ${remaining.toFixed(2)}`
                );
                error.statusCode = 400;
                throw error;
            }

            const newAmountPaid = Number(
                (amountPaid + paymentAmount).toFixed(2)
            );

            const newStatus = newAmountPaid >= total
                ? 'PAID'
                : 'PARTIALLY_PAID';

            const createdPayment = await tx.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    amount: paymentAmount.toFixed(2),
                    method: data.method,
                    transactionId: data.transactionId || null,
                    paymentDate: data.paymentDate || new Date(),
                    notes: data.notes || null,
                    status: 'COMPLETED'
                }
            });

            await tx.invoice.update({
                where: { id: data.invoiceId },
                data: {
                    amountPaid: newAmountPaid.toFixed(2),
                    status: newStatus
                }
            });

            return createdPayment;
        });

        const paymentWithInvoice = await prisma.payment.findUnique({
            where: { id: payment.id },
            include: paymentInclude
        });

        return res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: paymentWithInvoice
        });
    } catch (error) {
        console.error('Create payment error:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to record payment'
        });
    }
};

export const getPayments = async (req, res) => {
    try {
        const { invoiceId, method, status } = req.query;

        const validMethods = [
            'CASH',
            'CARD',
            'BANK_TRANSFER',
            'UPI',
            'OTHER'
        ];

        const validStatuses = [
            'PENDING',
            'COMPLETED',
            'FAILED',
            'REFUNDED'
        ];

        if (method && !validMethods.includes(method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }

        const payments = await prisma.payment.findMany({
            where: {
                ...(invoiceId && { invoiceId }),
                ...(method && { method }),
                ...(status && { status })
            },
            include: paymentInclude,
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get payments error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve payments'
        });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment ID'
            });
        }

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: paymentInclude
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment'
        });
    }
};
