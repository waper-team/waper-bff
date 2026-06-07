import { Router } from 'express';
import { login, logout, testProtectedResource } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js'; // Middleware para proteger rutas que requieren autenticación

const router = Router();

// Endpoint: POST http://localhost:3000/api/auth/login
router.post('/login', login);

router.use(requireAuth); // Middleware que se aplicará a todas las rutas definidas después de esta línea para abajo
// Rutas PROTEGIDAS (Inyectamos al guardia justo en el medio)
router.post('/logout', logout);
router.get('/protected', testProtectedResource);

//router.post('/logout', requireAuth, logout);
//router.get('/perfil-prueba', requireAuth, testProtectedResource);

export default router;