
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const customerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    phone: z.string().trim().max(20).optional(),
    company: z.string().trim().max(150).optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    country: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional()
});

// CREATE CUSTOMER

export const createCustomer = async (req, res) => {
    try {
        const result = customerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors
            });
        }

        const email = result.data.email.toLowerCase();

        const existingCustomer = await prisma.customer.findUnique({
            where: { email }
        });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: 'Customer email already exists'
            });
        }

        const customer = await prisma.customer.create({
            data: {
                ...result.data,
                email
            }
        });

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            customer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to create customer'
        });
    }
};

// GET ALL CUSTOMERS

export const getCustomers = async (req, res) => {
    try {
        const { search } = req.query;

        const customers = await prisma.customer.findMany({
            where: search ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        company: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                ]
            } : {},

            include: {
                _count: {
                    select: {
                        subscriptions: true,
                        invoices: true
                    }
                }
            },

            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers'
        });
    }
};

// GET SINGLE CUSTOMER

export const getCustomerById = async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: req.params.id
            },

            include: {
                subscriptions: {
                    include: {
                        plan: {
                            include: {
                                product: true
                            }
                        }
                    }
                },

                invoices: true
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            customer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer'
        });
    }
};

// UPDATE CUSTOMER

export const updateCustomer = async (req, res) => {
    try {
        const result = customerSchema.partial().safeParse(req.body);

        if (!result.success || Object.keys(result.data || {}).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Provide valid customer details',
                errors: result.success ? undefined : result.error.flatten().fieldErrors
            });
        }

        const data = { ...result.data };

        if (data.email) {
            data.email = data.email.toLowerCase();

            const existing = await prisma.customer.findUnique({
                where: {
                    email: data.email
                }
            });

            if (existing && existing.id !== req.params.id) {
                return res.status(409).json({
                    success: false,
                    message: 'Customer email already exists'
                });
            }
        }

        const customer = await prisma.customer.update({
            where: {
                id: req.params.id
            },
            data
        });

        res.json({
            success: true,
            message: 'Customer updated successfully',
            customer
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to update customer'
        });
    }
};

// DELETE CUSTOMER

export const deleteCustomer = async (req, res) => {
    try {
        await prisma.customer.delete({
            where: {
                id: req.params.id
            }
        });

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (error.code === 'P2003' || error.code === 'P2014') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete customer with existing subscriptions or invoices'
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete customer'
        });
    }
};
