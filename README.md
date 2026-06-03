# Configuración y Ejecución del BFF (Node.js)

Este documento detalla los comandos necesarios para instalar las dependencias y levantar el servidor intermediario (BFF) de WAPER.

## 1. Instalación de Dependencias

Abre la terminal en la raíz de la carpeta de tu proyecto Node.js y ejecuta los siguientes comandos.

**Dependencias base:**
```bash
npm install express cors cookie-parser
npm install -D nodemon

npm run dev #Para desarrollar (Entorno local)
              ó
npm start #Para producción 
```

## 4. Variables de Entorno (.env)

El proyecto utiliza variables de entorno para no exponer datos sensibles ni "quemar" URLs en el código. 

Debes crear un archivo llamado `.env` en la raíz del proyecto (este archivo es ignorado por Git) basándote en la siguiente estructura:

\`\`\`env
```bash
# Puerto del BFF
PORT=3000

# URL Frontend
FRONTEND_URL=http://localhost:5173

# URL de Spring Boot Backend
BACKEND_URL=http://localhost:8080
```

\`\`\`

---

## 5. Estructura del Proyecto

Para mantener la separación de responsabilidades, el código fuente dentro de la carpeta `src/` está organizado de la siguiente manera:

Para mantener la separación de responsabilidades, el código fuente dentro de la carpeta `src/` está organizado de la siguiente manera:

```text
src/
 ┣ controllers/    # Lógica de las rutas (manejo de req y res)
 ┣ middlewares/    # Interceptores (ej. validación de JWT en la cookie)
 ┣ routes/         # Definición de los endpoints y verbos HTTP
 ┣ services/       # Lógica de negocio y llamadas de red (fetch a Spring Boot)
 ┗ server.js       # Punto de entrada y configuración de Express
