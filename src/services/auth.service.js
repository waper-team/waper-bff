export const loginService = async (email, password) => {
    // Leemos el .env (por defecto viene como string)
    const useMock = process.env.USE_MOCK === 'true';

    // EL SIMULADOR (Mock) 
    if (useMock) {
        console.log("🟡 ALERTA: Usando Backend Simulado (Mock)");
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay simulado

        if (email === "admin@waper.app" && password === "123456") {
            return {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gV0FQRVIiLCJpYXQiOjE1MTYyMzkwMjJ9.MockSignature123",
                user: { id: 1, name: "Administrador", role: "STUDENT" }
            };
        }
        throw new Error("Credenciales inválidas (Mock)");
    }

    // === LA CONEXIÓN REAL cuando provenga el token del backend ===
    console.log("🟢 Conectando con Spring Boot real...");
    const backendUrl = process.env.BACKEND_URL;
    console.log("URL LEÍDA DEL .ENV:", backendUrl); // <-- Agrega esto
    const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error("Credenciales inválidas en el servidor central");
    }

    return await response.json(); 
};