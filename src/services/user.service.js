// Get api/users/:id  -> Usado por el profile para mostrar su info   
//name
//username
//email
//bio
//profileImage
//interests (array de strings)

import redisClient from '../config/redis.js';

//email === "said@waper.app" && password === "123456" => usuario válido para el mock

// Simulación temporal con formato MongoDB para que React lo entienda
export const mockDatabase = {
    "6a26cdc0e953d58f42ac971e": {
        _id: "6a26cdc0e953d58f42ac971e", // Clave: React busca esto
        name: "Said",
        username: "said_systemas",
        email: "said@waper.app",
        password: "123456", //Este campo no se envia a React, solo está para saber cual es la contraseña válida en el mock, no se guarda en el perfil ni se muestra a React
        rol: "STUDENT",
        bio: "Estudiante de Ingeniería de Sistemas y Desarrollador Backend.",
        // profileImage: "https://www.imdb.com/es/name/nm0430107/mediaviewer/rm2297940480/?ref_=nm_ov_ph",
        interests: ["Programación", "Fútbol", "Electrónica"],
        friendsCount: 15,
        streakCount: 5
    },
    "6a26d0ccc73a2d96ea2e9cf4": {
        _id: "6a26d0ccc73a2d96ea2e9cf4",
        name: "Caty",
        email: "cat@waper.app",
        password: "gatitosvoladores",
        role: "STUDENT",
        bio: "Me gusta la matemática",
        interests: ["travel", "cooking"]
    }
};



/** Usuario real para el registro con Java Spring Boot (descomentar para usar)
export const createUser = async (userData) => {
    const backendUrl = process.env.BACKEND_URL;

    //Payload completo para Spring Boot
    const payload = {
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: userData.password, // 🔴 AÑADIR ESTO: Node se lo pasa a Java
        bio: "", 
        profileImage: "", 
        interests: [],
        followersCount: 0,
        followingCount: 0
    };

    // Verifica qué ruta exige tu backend de Java para registrar.
    // '/api/auth/register' o '/api/users'. 
    const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "El backend de Java rechazó el registro");
    }

    const createdUser = await response.json();
    return createdUser;
};
 */

// Crear un nuevo usuario -> Post api/users/

export const createUser = async (userData) => {
    const useMock = process.env.USE_MOCK === 'true';

    // usando el mock
    // ==========================================
    if (useMock) {
        console.log("🟡 ALERTA: Usando Backend Simulado (Mock) para Registro");
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay simulado

        // Generamos un ID hexadecimal aleatorio simulando a MongoAtlas
        const newId = Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14);

        // Armamos el perfil por defecto
        const newUser = {
            _id: newId,
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            password: userData.password, 
            role: "STUDENT", 
            bio: "¡Hola! Soy nuevo en WAPER y estoy configurando mi perfil.",
            profileImage: "",
            interests: [],
            friendsCount: 0,
            streakCount: 0
        };

        // Lo guardamos en la base de datos simulada
        mockDatabase[newId] = newUser;

        console.log("🟢 Nuevo usuario creado (Mock) con ID:", newId);
        return newUser;
    }

    // 🚀 conexion a spirng boot
    // ==========================================
    console.log("🟢 Enviando datos de registro a Spring Boot real...");
    const backendUrl = process.env.BACKEND_URL;
    
    // Hacemos la petición POST al backend central
    const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        // Enviamos el objeto userData (que contiene name, username, email y password en texto plano)
        body: JSON.stringify(userData) 
    });

    // Manejo de errores si Java detecta que el email ya está registrado)
    if (!response.ok) {
        // Intentamos leer el mensaje de error que envíe Java
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || "Error al crear el usuario en el servidor central");
    }

    // Retornamos el objeto del usuario recién creado tal como lo devuelve Spring Boot
    return await response.json();
};


export const getUserById = async (id) => {
    //Definimos la llave para Redis
    const cacheKey = `user:${id}:profile`;

    //Intentamos leer de Redis primero, si falla o no existe, vamos a la base de datos (Mock o Java)
    try {
        const cachedProfile = await redisClient.get(cacheKey);
        if (cachedProfile) {
            console.log("Perfil obtenido desde Redis (Cache Hit)");
            return JSON.parse(cachedProfile);
        }
    } catch (redisError) {
        console.error("Error leyendo de Redis, pasando directo a la BD:", redisError);
        // No lanzamos el error para que la app no se caiga si Redis falla
    }

    console.log("Buscando en la base de datos (Cache Miss)...");
    
    //Preparamos la variable donde guardaremos el usuario
    let userProfile;
    const useMock = process.env.USE_MOCK === 'true';

    if (useMock) {
        // ===============
        // MODO DESARROLLO: Buscar en Mock
        // =====================
        userProfile = mockDatabase[id];
        console.log("Obteniendo perfil desde Mock Database:", userProfile);

        if (!userProfile) {
            throw new Error("USER_NOT_FOUND");
            console.warn(`Usuario con ID ${id} no encontrado en el Mock.`);
        }
    } else {
        // ==========================================
        //   (Spring Boot)
        // ==========================================
        const backendUrl = process.env.BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/users/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("USER_NOT_FOUND");
            throw new Error("Error de conexión con el backend central de Java");
        }
        userProfile = await response.json();
        console.log("Perfil obtenido desde el backend de Java:", userProfile);
    }

    // Guardamos el resultado en Redis para la próxima vez (1 hora = 3600 seg)
    try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(userProfile));
    } catch (redisError) {
        console.error("No se pudo guardar en Redis:", redisError);
    }

    // Retornamos el usuario y su perfil completo a React ya guardado en Redis
    return userProfile;
};

/* 
export const updateUser = async (id, updateData) => {
    const backendUrl = process.env.BACKEND_URL;

    // React nos mandó updateData (bio, interests, name, etc.)
    // Node.js se lo reenvía exactamente igual a Java
    const response = await fetch(`${backendUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("USER_NOT_FOUND");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el usuario en Java");
    }

    // Devolvemos el usuario actualizado
    const updatedUser = await response.json();
    return updatedUser;
};
*/


// Actualizar usuario PUT api/users/:id
export const updateUser = async (id, updateData) => {
    if (!mockDatabase[id]) {
        throw new Error("USER_NOT_FOUND");
    }

    // Actualizamos fusionando los datos viejos con los nuevos
    mockDatabase[id] = {
        ...mockDatabase[id],
        ...updateData
    };

    return mockDatabase[id];
};


//GET /api/interests

export const getUserInterests = async (id) => {
    // Si el perfil está en Redis, tarda milisegundos.
    const userProfile = await getUserById(id);
    
    // Extraemos y devolvemos exclusivamente el arreglo de intereses
    return userProfile.interests || [];
};