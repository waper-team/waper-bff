import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const OFFLINE_MODE = process.env.OFFLINE_MODE === 'true';

let redisClient;

if (OFFLINE_MODE) {
    console.log('MODO OFFLINE ACTIVADO: usando Redis en memoria.');

    const memoryStore = new Map();

    const getEntry = (key) => {
        const entry = memoryStore.get(key);

        if (!entry) return null;
        if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
            memoryStore.delete(key);
            return null;
        }

        return entry.value;
    };

    redisClient = {
        get: async (key) => getEntry(key),
        setEx: async (key, seconds, value) => {
            memoryStore.set(key, {
                value,
                expiresAt: Date.now() + Number(seconds) * 1000,
            });
            return 'OK';
        },
        del: async (...keys) => {
            let deleted = 0;
            keys.flat().forEach((key) => {
                if (memoryStore.delete(key)) deleted += 1;
            });
            return deleted;
        },
        ping: async () => 'PONG',
        quit: async () => {
            memoryStore.clear();
            redisClient.isOpen = false;
            return 'OK';
        },
        isOpen: true,
    };
} else {
    redisClient = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            tls: process.env.REDIS_TLS === 'true',
            connectTimeout: 10000,
            reconnectStrategy: (retries) => {
                if (retries >= 3) {
                    return new Error('No se pudo conectar con Redis');
                }
                return Math.min(retries * 500, 2000);
            },
        },
    });

    redisClient.on('error', (error) => {
        console.error('Error en Redis:', error.message);
    });

    await redisClient.connect();
    console.log('Conectado exitosamente a Redis Cloud');
}

const closeRedisConnection = async () => {
    if (redisClient.isOpen) {
        console.log('Cerrando la conexion de Redis...');
        await redisClient.quit();
    }
    process.exit(0);
};

process.on('SIGINT', closeRedisConnection);
process.on('SIGTERM', closeRedisConnection);
process.on('SIGUSR2', async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
    process.kill(process.pid, 'SIGUSR2');
});

export default redisClient;
