
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { prisma } from '../config/prisma.js';

// VALIDATION SCHEMAS

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(150),
    password: z.string().min(8).max(72),
    phone: z.string().trim().max(20).optional()
});

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
});

// GENERATE JWT TOKEN

function generateToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
}

// CUSTOMER REGISTRATION

export const register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration details',
                errors: result.error.flatten().fieldErrors
            });
        }

        const { name, email, password, phone } = result.data;

        const normalizedEmail = email.toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        const existingCustomer = await prisma.customer.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: 'Customer email already exists'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.$transaction(async (tx) => {
            return tx.user.create({
                data: {
                    name,
                    email: normalizedEmail,
                    passwordHash,
                    role: 'CUSTOMER',

                    customer: {
                        create: {
                            name,
                            email: normalizedEmail,
                            phone
                        }
                    }
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

// USER LOGIN

export const login = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Valid email and password are required',
                errors: result.error.flatten().fieldErrors
            });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase()
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive'
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// GET CURRENT LOGGED-IN USER

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });

        if (!user || !user.isActive) {
            return res.status(404).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve profile'
        });
    }
};
