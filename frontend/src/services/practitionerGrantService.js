import api from "./api";

const practitionerGrantService = {
    // GET /grants
    getAll: async () => {
        const response = await api.get("/grants");
        return response.data;
    },

    // POST /grants/request
    requestAccess: async (dto) => {
        const response = await api.post("/grants/request", dto);
        return response.data;
    },

    // PUT /grants/{id}/approve
    updateStatus: async (id, status) => {
        const response = await api.put(
            `/grants/${id}/approve`,
            { status }
        );

        return response.data;
    },

    // DELETE /grants/{id}
    delete: async (id) => {
        const response = await api.delete(`/grants/${id}`);
        return response.data;
    },

    // PUT /grants/{id}/note
    updateNote: async (id, note) => {
        const response = await api.put(
            `/grants/${id}/note`,
            { note }
        );

        return response.data;
    },
};

export default practitionerGrantService;