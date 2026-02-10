import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(err => console.error('Redis connection failed:', err));

const prisma_check = new PrismaClient();

const healthCheck = async (_, res) => {
    try {
        const result = await prisma_check.$runCommandRaw({ ping: 1 });
        if (!result || result.ok !== 1) {
            throw new Error('MongoDB health check failed: Unexpected response.');
        } 
        await redisClient.ping(); 
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
}

export default healthCheck;