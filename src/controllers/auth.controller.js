import { loginService } from '../services/auth.service.js';
import * as authService from '../services/auth.service.js';

export const login = async (req, res) => {
    try {
        // Recibe los datos que el front envia en el formulario
        const { email, password } = req.body;

        //Llama al servicio (No le importa si es el mock o el backend)
        const data = await loginService(email, password);

        //Guarda el token en la cookie
        res.cookie('access_token', data.token, {
            httpOnly: true, //protección contra XSS
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', // Protección contra ataques CSRF
            maxAge: 1000 * 60 * 60 * 24 // Expira en 1 día (en milisegundos)
        });

        // Le responde a React SOLO con los datos del usuario y el rol
        console.log("🟢 EndPoint POST /api/auth/login funcionando bien"); //Borrar despues de pruebas
        res.status(200).json({
            message: "Autenticación exitosa",
            user: data.user
        });

    } catch (error) {
        // Si el servicio lanza el throw new Error("Credenciales inválidas...")
        // el catch lo atrapa y le avisa al frontend con un código 401
        console.error("Error en authController.login:", error); //Borrar despues de pruebas
        res.status(401).json({
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Extraemos el token de la cookie
        const token = req.cookies.access_token;
        
        if (!token) {
            return res.status(400).json({ message: "No hay una sesión activa para cerrar" });
        }

        //Enviamos el token a la lista negra de Redis
        await authService.blacklistToken(token);

        // Destruimos la cookie en el navegador del usuario
        res.clearCookie('access_token');

        console.log("🟢 EndPoint POST /api/auth/logout funcionando bien"); //Borrar despues de pruebas
        return res.status(200).json({ message: "Cierre de sesión exitoso. Cookie eliminada." });

    } catch (error) {
        console.error("Error en authController.logout:", error);
        return res.status(500).json({ message: "Error interno al cerrar la sesión" });
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