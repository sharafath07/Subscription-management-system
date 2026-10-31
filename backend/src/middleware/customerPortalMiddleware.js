import { prisma } from '../config/prisma.js';

export const requireCustomerProfile = async (req, res, next) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: {
                userId: req.user.userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        req.customer = customer;
        next();

    } catch (error) {
        console.error('Customer profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to load customer profile'
        });
    }
};