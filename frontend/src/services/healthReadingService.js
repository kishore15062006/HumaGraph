import api from "./api";

const healthReadingService = {
    // GET /readings
    getAll: async () => {
        const response = await api.get("/readings");
        return response.data;
    },

    // Alias for getAll()
    getReadings: async () => {
        const response = await api.get("/readings");
        return response.data;
    },

    // POST /readings
    create: async (dto) => {
        const response = await api.post("/readings", dto);
        return response.data;
    },

    // GET /readings/trends
    getTrends: async () => {
        const response = await api.get("/readings/trends");
        return response.data;
    },

    // GET /readings/patient/{profileId}
    getPatientReadings: async (profileId) => {
        const response = await api.get(`/readings/patient/${profileId}`);
        return response.data;
    },

    // PUT /readings/{id}
    update: async (id, dto) => {
        const response = await api.put(`/readings/${id}`, dto);
        return response.data;
    },

    // DELETE /readings/{id}
    delete: async (id) => {
        const response = await api.delete(`/readings/${id}`);
        return response.data;
    },
};

export default healthReadingService;