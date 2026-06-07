export const requireAuth = async (req, res, next) => {
    try {
        //pide la identificación (Extrae la cookie)
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ message: "Acceso denegado. No se encontró el token de sesión." });
        }

        //revisa la Lista Negra (Consulta a Redis)
        const redis = req.redis; // Usamos la instancia que inyectamos en app.js
        const isBlacklisted = await redis.get(`blacklist:${token}`);

        if (isBlacklisted) {
            return res.status(401).json({ message: "Sesión expirada o revocada. Por favor, vuelve a iniciar sesión." });
        }

        //Guardamos el token limpio en el objeto req 
        //por si el siguiente controlador necesita enviarlo a Spring Boot
        req.token = token;

        //Si Todo en orden. El se abre la puerta y continúa
        next();

    } catch (error) {
        console.error("Error en el middleware de autenticación:", error);
        return res.status(500).json({ message: "Error interno al validar la sesión" });
    }
};