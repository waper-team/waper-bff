// implementación utilizando ES Modules (import/export) y promesas con async/await.

// src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// === Middlewares Globales ===
app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
    origin: process.env.FRONTEND_URL, // <--  LEE EL .env
    credentials: true 
}));

// === Rutas de la API ===
app.use('/api/auth', authRoutes);

// === Inicialización ===
app.listen(PORT, () => {
    console.log(`BFF (Middle-end) corriendo exitosamente en http://localhost:${PORT}`);
});