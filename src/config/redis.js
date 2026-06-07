import { createClient } from 'redis';

export const createRedisConnection = async () => {
    const client = createClient({
        url: process.env.REDIS_URL // Lee la URL de Redis desde el .env
    });

    client.on('error', (err) => {
        console.error('Error en el cliente de Redis:', err);
    });

    client.on('connect', () => { //Si la conexión es exitosa, se ejecuta este evento
        console.log('Conexión establecida con Redis.');
    });

    // Inicia la conexión y devuelve la instancia lista para usar
    await client.connect(); // Espera a que la conexión se establezca antes de devolver el cliente
    return client;
};