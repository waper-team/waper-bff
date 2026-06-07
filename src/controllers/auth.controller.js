import { loginService } from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        // 1. Recibe los datos que el front envia en el formulario
        const { email, password } = req.body;

        // 2. Llama al servicio (No le importa si es el mock o el backend)
        const data = await loginService(email, password);

        // 3. INYECCIÓN DE SEGURIDAD: Guarda el token en la cookie
        res.cookie('access_token', data.token, {
            httpOnly: true, // React no puede leer esto (protección contra XSS)
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'strict', // Protección contra ataques CSRF
            maxAge: 1000 * 60 * 60 * 24 // Expira en 1 día (en milisegundos)
        });

        // 4. Le responde a React SOLO con los datos del usuario y el rol
        res.status(200).json({
            message: "Autenticación exitosa",
            user: data.user
        });

    } catch (error) {
        // Si el servicio lanza el throw new Error("Credenciales inválidas...")
        // el catch lo atrapa y le avisa al frontend con un código 401
        res.status(401).json({
            message: error.message
        });
    }
};

// Controlador para cerrar sesión
export const logout = (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (token) {
            const redisClient = req.redis; // Accedemos al cliente de Redis inyectado
            await redis.setEX(`blacklist:${token}`, 86400, "revoked") // Expira en 24 horas (86400 segundos)
            //redisClient.set(`blacklist:${token}`, "revoked", 'EX', 60 * 60 * 24); // Expira en 24 horas (en segundos)
        }

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ message: "Sesión cerrada y token revocado" });

    } catch (error) {
        return res.status(500).json({ message: "Error interno al cerrar sesión" });
    }
};

// Controlador de prueba para verificar que el BFF puede leer la cookie correctamente
export const testProtectedResource = (req, res) => {
    // Intentamos leer la cookie llamada 'access_token'
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No se encontró la cookie." });
    }

    // Si la cookie existe, respondemos con éxito
    return res.status(200).json({
        message: "¡Éxito! El BFF logró leer la cookie de forma segura.",
        token_recibido: token
    });
};