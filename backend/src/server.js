import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { prisma } from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Subscription Management System API is running!'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Backend server is healthy'
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});