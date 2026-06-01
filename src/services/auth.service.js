
export const loginMockService = async (email, password) => {
    // Simulamos un delay de red de 800ms para imitar la llamada a Spring Boot
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lógica temporal de validación
    if (email === "admin@waper.app" && password === "123456") {
        return {
            // Este JWT es falso, luego Spring Boot generará el real
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gV0FQRVIiLCJpYXQiOjE1MTYyMzkwMjJ9.MockSignature123",
            user: {
                id: 1,
                name: "Administrador",
                role: "STUDENT",
            }
        };
    }

    throw new Error("Credenciales inválidas");
};