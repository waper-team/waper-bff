// Get api/users/:id  -> Usado por el profile para mostrar su info   
//name
//username
//email
//bio
//profileImage
//interests (array de strings)

// Simulación temporal con formato MongoDB para que React lo entienda
const mockDatabase = {
    "6a26cdc0e953d58f42ac971e": {
        _id: "6a26cdc0e953d58f42ac971e", // Clave: React busca esto
        name: "Said",
        username: "said_systemas",
        email: "said@waper.app",
        bio: "Estudiante de Ingeniería de Sistemas y Desarrollador Backend.",
        profileImage: "https://www.imdb.com/es/name/nm0430107/mediaviewer/rm2297940480/?ref_=nm_ov_ph",
        interests: ["Programación", "Fútbol", "Electrónica"],
        friendsCount: 15,
        streakCount: 5
    }
};

// Crear un nuevo usuario -> Post api/users/
export const createUser = async (userData) => {
    // 1. Generamos un ID hexadecimal aleatorio simulando a MongoAtlas
    const newId = Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14);

    // 2. Armamos el perfil por defecto para el nuevo usuario en WAPER
    const newUser = {
        _id: newId,
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        bio: "¡Hola! Soy nuevo en WAPER y estoy configurando mi perfil.",
        profileImage: "https://via.placeholder.com/150",
        interests: [],
        friendsCount: 0,
        streakCount: 0
    };

    // 3. Lo guardamos en nuestra base de datos simulada
    mockDatabase[newId] = newUser;

    // 4. Devolvemos el usuario recién creado
    return newUser;
};

// Obtener usuario GET api/users/:id
export const getUserById = async (id) => {
    const user = mockDatabase[id];
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
};

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