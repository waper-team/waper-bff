# 🚀 Guía de Configuración Local - WAPER BFF (Middle-end)

Para ejecutar este servidor en tu entorno local, es **obligatorio** seguir estos 3 pasos en orden. El servidor está configurado con un patrón *Fail-Fast*; si la base de datos en memoria no está corriendo, el proceso de Node.js se detendrá automáticamente para evitar estados inconsistentes.

## 🛠️ Requisitos Previos
* [Node.js](https://nodejs.org/) (v18 o superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose.

---

## Paso 1: Levantar la Infraestructura (Redis)
Utilizamos Redis como base de datos en memoria para gestionar la revocación de tokens (Lista Negra). Abre tu terminal (asegúrate de tener Docker Desktop abierto) y ejecuta el siguiente comando para crear y levantar el contenedor en segundo plano:

```bash
docker run --name waper-redis -p 6379:6379 -d redis

# Puerto del servidor BFF
PORT=3000

# URLs de los clientes y servicios
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# Conexión a la caché en memoria (Docker)
REDIS_URL=redis://127.0.0.1:6379

# Feature Toggle: true (Devuelve usuario simulado) | false (Conecta a Spring Boot real)
USE_MOCK=true
```

## Paso 2: Ejecutar los siguientes comandos:
```bash
npm install
npm run dev
```
Criterio de éxito: Si todo está configurado correctamente, verás estos dos mensajes en tu terminal:

🔵 Conexión establecida con Redis.
BFF (Middle-end) corriendo exitosamente en el puerto 3000

---

# 🧪 Guía de Pruebas de Endpoints (Postman / Thunder Client)

Como el sistema utiliza Cookies HttpOnly, tu cliente HTTP (Postman) gestionará la cookie automáticamente una vez que inicies sesión. Sigue este flujo exacto para probar la seguridad:

## 1. 🔑 Iniciar Sesión
Obtiene el token de acceso y lo guarda automáticamente en las cookies de tu cliente.

Método: POST
```bash
URL: http://localhost:3000/api/auth/login

Body (JSON):

JSON
{
  "email": "admin@waper.app",
  "password": "123456"
}
```
Respuesta Esperada: 200 OK con los datos del perfil (Mock) y la inyección de la cookie access_token.

## 2. 🟢 Acceder a Ruta Protegida
Verifica que el middleware (requireAuth) puede leer la cookie correctamente.
```bash
Método: GET

URL: http://localhost:3000/api/auth/protected
```
Respuesta Esperada: 200 OK con el mensaje de éxito. (Si intentas esto sin haber hecho login primero, recibirás un 401 Unauthorized).

## 3. 🚪 Cerrar Sesión
Destruye la cookie en el cliente y envía el token a la Lista Negra de Redis.
```bash
Método: POST

URL: http://localhost:3000/api/auth/logout
```
Respuesta Esperada: 200 OK con el mensaje "Sesión cerrada y token revocado".

## 4. 🛑 Comprobar Lista Negra (Intento de Intrusión)
Verifica que la caché está bloqueando tokens revocados.
```bash
Método: GET

URL: http://localhost:3000/api/auth/protected (Repetir el paso 2).
```
Respuesta Esperada: El servidor interceptará la petición y devolverá un 401 Unauthorized con el mensaje "Sesión expirada o revocada", confirmando que la base de datos de Redis está protegiendo la ruta con éxito.
