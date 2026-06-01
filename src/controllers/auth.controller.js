import { loginMockService } from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        // 1. Extraemos las credenciales del cuerpo de la petición
        const { email, password } = req.body;
        
        // 2. Ejecutamos el servicio mockeado
        const { token, user } = await loginMockService(email, password);

        // 3. Construimos e inyectamos la cookie HttpOnly
        res.cookie('access_token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
            sameSite: 'strict', 
            maxAge: 3600000 // 1 hora
        });

        // 4. Respondemos a React solo con la metadata del usuario, NUNCA con el token
        res.status(200).json({ 
            message: "Autenticación exitosa", 
            user 
        });
    } catch (error) {
        // Manejo de errores (ej. credenciales inválidas)
        res.status(401).json({ message: error.message });
    }
};

// Controlador para cerrar sesión
export const logout = (req, res) => {
    // Sobrescribimos la cookie con una fecha de expiración inmediata
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
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