import api from "./api";

const healthGoalService = {
    // GET /goals
    getAll: async () => {
        const response = await api.get("/goals");
        return response.data;
    },

    // POST /goals
    create: async (dto) => {
        const response = await api.post("/goals", dto);
        return response.data;
    },

    // PUT /goals/{id}
    update: async (id, dto) => {
        const response = await api.put(`/goals/${id}`, dto);
        return response.data;
    },

    // DELETE /goals/{id}
    delete: async (id) => {
        const response = await api.delete(`/goals/${id}`);
        return response.data;
    },
};

export default healthGoalService;