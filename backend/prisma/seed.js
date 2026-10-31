
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password || password.length < 8) {
        throw new Error('Valid admin environment variables are required');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            passwordHash,
            role: 'ADMIN',
            isActive: true
        },
        create: {
            name,
            email,
            passwordHash,
            role: 'ADMIN',
            isActive: true
        }
    });

    console.log('Admin account created or updated:', admin.email);
}

main()
    .catch((error) => {
        console.error('Admin seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
