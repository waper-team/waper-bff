import redisClient from '../config/redis.js';
import jwt from 'jsonwebtoken';
import { mockDatabase } from './user.service.js';

export const loginService = async (email, password) => {
    const useMock = process.env.USE_MOCK === 'true';

    // ==========================================
    // simulador con el mock de user.service.js
    if (useMock) {
        console.log("ALERTA: Usando Backend Simulado (Mock)");
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay simulado

        //Convertimos el objeto mockDatabase en un array para poder buscar por email
        const usersArray = Object.values(mockDatabase);
        const userFound = usersArray.find(u => u.email === email);

        // Validamos que el usuario exista y que la contraseña coincida
        if (!userFound || userFound.password !== password) {
            throw new Error("Credenciales inválidas");
        }

        //Preparamos el payload dinámico con los datos del usuario encontrado
        const payload = {
            id: userFound._id, // o userFound.id ?
            role: userFound.role || "STUDENT" 
        };

        //Generamos el token válido
        const realToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'secret_key_waper', 
            { expiresIn: '1h' }
        );

        // Devolvemos los datos reales del usuario que inició sesión
        return {
            token: realToken,
            user: {
                id: userFound._id,
                name: userFound.name,
                role: payload.role
            }
        };
    }

    // ==================================
    // Conexion real con el backend
    console.log("🟢 Conectando con Spring Boot real...");
    const backendUrl = process.env.BACKEND_URL;
    const response = await fetch(`${backendUrl}/api/public/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
    });

    if (!response.ok) {
        throw new Error("Credenciales inválidas en el servidor central");
    }

    return await response.json();
};

export const blacklistToken = async (token) => {
    try {
        // Decodificamos el JWT para inspeccionar su payload sin verificar la firma todavía
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.exp) {
            // Si el token no tiene expiración por alguna razón, lo invalidamos por un tiempo (ej. 2 horas)
            await redisClient.setEx(`blacklist:${token}`, 7200, 'true');// 7200 segundos = 2 horas
            console.warn("Token sin expiración detectado. Se ha añadido a la lista negra por 2 horas.");
            return;
        }

        // Calculamos el tiempo en segundos que le queda de vida al token
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const remainingTime = decoded.exp - nowInSeconds;

        if (remainingTime > 0) {
            // Se almacena en Redis con el tiempo de vida restante exacto
            await redisClient.setEx(`blacklist:${token}`, remainingTime, 'true');
            console.log(`Token añadido a la lista negra. Expira en ${remainingTime} segundos.`);
        }
    } catch (error) {
        console.error("Error al registrar en la lista negra de Redis:", error);
        throw new Error("No se pudo procesar el cierre de sesión");
    }
};