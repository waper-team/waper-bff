import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';

export const verifyToken = async (req, res, next) => {
    try {
        //Buscamos el token en las cookies
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ message: "Acceso denegado. Token no proporcionado en las cookies." });
        }

        console.log("🔍 Token recibido en el middleware:", token);

        //CONTROL DE REDIS: Verificar si el token está revocado (Lista Negra)
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            console.log("Intento de acceso bloqueado: El token está en la lista negra.");
            return res.status(401).json({ message: "Sesión inválida. Por favor, inicia sesión de nuevo." });
        }

        //CONTROL CRIPTOGRÁFICO: Verifica validez y firma del JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_waper');
        
        req.user = decoded; //Contiene id y rol
        next();

    } catch (error) {
        console.error("Error de validación de token:", error.message);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};