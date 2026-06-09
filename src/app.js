import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

// La función constructora recibe el cliente de Redis como parámetro
export const buildApp = () => {
    const app = express();

    // === Middlewares Globales ===
    app.use(express.json());
    app.use(cookieParser());
    //Configurar CORS para Frontend se conecte con el BFF

    app.use(cors({
        origin: process.env.FRONTEND_URL, // <--  LEE EL .env -> URL donde corre React
        credentials: true // Para que el navegador permita el envío de cookies
    }));

    // === Rutas de la API ===
    // Ruta de autenticación (login, logout, etc.)
    app.use('/api/auth', authRoutes);
    // Registrar el nuevo endpoint de usuarios
    app.use('/api/users', userRoutes);

    return app;
};