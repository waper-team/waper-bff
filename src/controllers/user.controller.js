import * as userService from '../services/user.service.js';

export const createUserProfile = async (req, res) => {
    try {
        const userData = req.body; // React envía: { name, username, email }

        // Validamos que por lo menos venga el email
        if (!userData.email) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio" });
        }

        // Llamamos a la capa de datos
        const newUser = await userService.createUser(userData);
        
        // Respondemos con código 201 y el objeto del usuario
        return res.status(201).json(newUser);

    } catch (error) {
        console.error("Error en createUserProfile:", error);
        return res.status(500).json({ message: "Error interno al crear el usuario" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        
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
        const updateData = req.body; // React ya manda name, username, bio, etc.

        const updatedUser = await userService.updateUser(id, updateData);
        
        return res.status(200).json(updatedUser);

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        }
        console.error("Error en updateUserProfile:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};