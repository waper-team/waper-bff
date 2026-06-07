// implementación utilizando ES Modules (import/export) y promesas con async/await.

// src/server.js
import 'dotenv/config';
import { buildApp } from './app.js';
import { createRedisConnection } from './config/redis.js';

const PORT = process.env.PORT || 3000;

const bootstrapServer = async () => {
    try {
        //Iniciamos la conexión a Redis antes de arrancar el servidor
        const redisClient = await createRedisConnection();// (await)Esperamos a que la conexión se establezca antes de continuar

        // Construimos la aplicación Express inyectando el cliente de Redis
        const app = buildApp(redisClient);

        // Levantamos el servidor
        app.listen(PORT, () => {
            console.log(`BFF (Middle-end) corriendo exitosamente en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al arrancar el servidor:', error);
    }
}

bootstrapServer();