import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const projectRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..'
);

const envLocalPath = path.join(projectRoot, '.env.local');
const envPath = path.join(projectRoot, '.env');
dotenv.config({
   path: fs.existsSync(envLocalPath) ? envLocalPath : envPath
});

if (!process.env.DIRECT_URL && process.env.DATABASE_URL_UNPOOLED) {
    process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
}

export const prisma = new PrismaClient();