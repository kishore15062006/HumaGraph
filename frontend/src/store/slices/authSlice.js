import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: JSON.parse(localStorage.getItem("humagraph_user")) || null,
    token: localStorage.getItem("humagraph_token") || null,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;

            localStorage.removeItem("humagraph_token");
            localStorage.removeItem("humagraph_user");
        }

    },

    extraReducers: (builder) => {
        // Login/register thunks can be added here.
    }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;