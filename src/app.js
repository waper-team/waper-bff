import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

// La función constructora recibe el cliente de Redis como parámetro
export const buildApp = (redisClient) => {
    const app = express();

    // === Middlewares Globales ===
    app.use(express.json()); 
    app.use(cookieParser()); 
    app.use(cors({
        origin: process.env.FRONTEND_URL, // <--  LEE EL .env
        credentials: true 
    }));

    // === Inyección de Dependencias ===
    app.use((req, res, next) => {
        req.redis = redisClient; // Inyectamos el cliente de Redis en cada solicitud para que los controladores puedan usarlo
        next();
    });

    // === Rutas de la API que tienen acceso a Redis ===
    app.use('/api/auth', authRoutes);

    return app;
};