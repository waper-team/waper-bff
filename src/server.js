import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = process.env.PORT || 3000;

const bootstrapServer = async () => {
    try {

        // Construimos la aplicación
        const app = buildApp();

        // Levantamos el servidor
        app.listen(PORT, () => {
            console.log(`BFF (Middle-end) corriendo exitosamente en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al arrancar el servidor:', error);
    }
}

bootstrapServer();