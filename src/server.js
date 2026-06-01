// implementación utilizando ES Modules (import/export) y promesas con async/await.

// src/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// === Middlewares Globales ===
app.use(express.json()); // Permite a Express leer JSON en el req.body
app.use(cookieParser()); // Permite a Express leer y escribir cookies
app.use(cors({
    origin: 'http://localhost:5173', // Cambia esto al puerto que use tu frontend en React (ej. Vite usa 5173)
    credentials: true // OBLIGATORIO: Permite el envío y recepción de cookies entre dominios cruzados
}));

// === Rutas de la API ===
app.use('/api/auth', authRoutes);

// === Inicialización ===
app.listen(PORT, () => {
    console.log(`BFF (Middle-end) corriendo exitosamente en http://localhost:${PORT}`);
});