import api from "./api";

const authService = {
    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    register: async (dto) => {
        const response = await api.post("/auth/register", dto);
        return response.data;
    },
};

export default authService;