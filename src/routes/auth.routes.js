import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { testProtectedResource } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'; // Middleware para proteger la ruta de logout y el endpoint de prueba

const router = Router();

// Endpoint: POST http://localhost:3000/api/auth/login
router.post('/login', login);

router.use(verifyToken);

// Endpoint: POST http://localhost:3000/api/auth/logout
router.post('/logout', logout);
router.get('/protected', testProtectedResource);// Endpoint de prueba para verificar que el BFF puede leer la cookie correctamente. eliminarlo cuando se integre con Spring Boot

export default router;
