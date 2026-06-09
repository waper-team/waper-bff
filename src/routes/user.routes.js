import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = Router();

//EndPoint Get http://localhost:3000/api/users/:id
router.get('/:id', getUserProfile);
//EndPoint Put http://localhost:3000/api/users/:id
router.put('/:id', updateUserProfile);

export default router;