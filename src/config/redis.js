import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const OFFLINE_MODE = process.env.OFFLINE_MODE === 'true';

let redisClient;

if (OFFLINE_MODE) {
    console.log('⚠️ MODO OFFLINE ACTIVADO: Simulando Redis. Trabajando sin internet...');
    
    // Creamos un "Doble de Acción" que engaña a todo tu código
    redisClient = {
        get: async (key) => null,               // Siempre simula un Cache Miss y deja pasar en la lista negra
        setEx: async (key, time, value) => 'OK', // Finge que guardó el dato exitosamente
        quit: async () => true,                 // Cierra sin errores
        isOpen: true                            // Le miente al Graceful Shutdown para que no falle
    };

} else {
    // ==========================================
    // 🌐 TU CÓDIGO ORIGINAL DE CONEXIÓN REAL
    // ==========================================
    redisClient = createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    });

    redisClient.on('error', (err) => console.error('Error en Redis:', err));
    
    // Conectamos (Esto es lo que bloquea tu app si no hay internet)
    await redisClient.connect();
    console.log('🟢 Conectado exitosamente a Redis Cloud');
}

// ==========================================
// 🛡️ MANEJO DE CIERRE ELEGANTE (Graceful Shutdown)
// ==========================================
const closeRedisConnection = async () => {
    if (redisClient.isOpen) {
        console.log('🔴 Cerrando la conexión a Redis de forma segura...');
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