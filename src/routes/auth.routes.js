import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { testProtectedResource } from '../controllers/auth.controller.js';

const router = Router();

// Endpoint: POST http://localhost:3000/api/auth/login
router.post('/login', login);
router.get('/protected', testProtectedResource);// Endpoint de prueba para verificar que el BFF puede leer la cookie correctamente. eliminarlo cuando se integre con Spring Boot

export default router;