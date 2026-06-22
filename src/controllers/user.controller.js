import * as userService from '../services/user.service.js';
import redisClient from '../config/redis.js';

export const createUserProfile = async (req, res) => {
    try {
        const userData = req.body; // { name, username, email, password }

        // Validamos que por lo menos venga el email y la contraseña
        if (!userData.email || !userData.password) {
            return res.status(400).json({ message: "El correo electrónico y la contraseña son obligatorios" });
        }

        // Llamamos a la capa de datos
        const newUser = await userService.createUser(userData);
        
        console.log("🟢 EndPoint POST /api/users (Registro) funcionando bien");//Borrar despues de pruebas
        // Respondemos con código 201 y el objeto del usuario
        return res.status(201).json(newUser);

    } catch (error) {
        console.error("Error en createUserProfile:", error);
        return res.status(400).json({ message: error.message || "Error al crear el perfil de usuario" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.id !== id) {
            return res.status(403).json({ message: "No puedes acceder a otro perfil" });
        }
        const user = await userService.getUserById(id, req.accessToken);
        
        console.log("🟢 EndPoint GET /api/users/:id (Obtener Perfil) funcionando bien");//Borrar despues de pruebas
        // Le devolvemos a React el objeto exacto
        return res.status(200).json(user);

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        console.error("Error en getUserProfile:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.id !== id) {
            return res.status(403).json({ message: "No puedes editar otro perfil" });
        }
        const updateData = req.body; // React ya manda name, username, bio, etc.

        // Actualizamos en la base de datos primero con los datos nuevos
        const updatedUser = await userService.updateUser(id, updateData, req.accessToken);
        // INVALIDACIÓN DE CACHÉ en Redis
        // Si la base de datos se actualizó con éxito, borramos la memoria vieja
        const cacheKey = `user:${id}:profile`;
        try {
            console.log("🟢 EndPoint PUT /api/users/:id (Actualización) funcionando bien 1");//Borrar despues de pruebas
            await redisClient.del(cacheKey);
            console.log(`Caché invalidado exitosamente para la llave: ${cacheKey}`);
        } catch (redisError) {
            // Solo imprimimos el error, no rompemos la ejecución si Redis falla
            console.error("Error intentando borrar el caché en updateUserProfile en Redis:", redisError);
        }

        // Respondemos al frontend con los datos nuevos
        console.log("🟢 EndPoint PUT /api/users/:id (Actualización) funcionando bien 2");//Borrar despues de pruebas
        return res.status(200).json(updatedUser);

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        }
        console.error("Error en updateUserProfile:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
