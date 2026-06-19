import { Router } from 'express';
import { createUserProfile ,getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'; // Middleware para proteger las rutas de usuario   

const router = Router();

//EndPoint Post http://localhost:3000/api/users
router.post('/', createUserProfile);

// Protegemos las rutas de usuario con el middleware de autenticación
//router.use(verifyToken);

//EndPoint Get http://localhost:3000/api/users/:id
router.get('/:id', getUserProfile);
//EndPoint Put http://localhost:3000/api/users/:id
router.put('/:id', updateUserProfile);

export default router;