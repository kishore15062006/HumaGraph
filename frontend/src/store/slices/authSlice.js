import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Initial authentication state
const initialState = {
    user: JSON.parse(localStorage.getItem("humagraph_user")) || null,
    token: localStorage.getItem("humagraph_token") || null,
    loading: false,
    error: null,
    isAuthenticated:
        !!localStorage.getItem("humagraph_token"),
};


// LOGIN
export const login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);

            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Login failed"
            );
        }
    }
);


// REGISTER
export const registerUser = createAsyncThunk(
    "auth/register",
    async (dto, { rejectWithValue }) => {
        try {
            const response = await authService.register(dto);

            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Registration failed"
            );
        }
    }
);


const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {

        // Manual login success action
        loginSuccess: (state, action) => {

            const { user, token } = action.payload;

            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.error = null;

            localStorage.setItem(
                "humagraph_token",
                token
            );

            localStorage.setItem(
                "humagraph_user",
                JSON.stringify(user)
            );
        },


        // Logout
        logout: (state) => {

            localStorage.removeItem(
                "humagraph_token"
            );

            localStorage.removeItem(
                "humagraph_user"
            );

            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },


    extraReducers: (builder) => {

        // =========================
        // LOGIN
        // =========================

        builder
            .addCase(login.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            .addCase(login.fulfilled, (state, action) => {

                state.loading = false;
                state.error = null;

                const { user, token } = action.payload;

                state.user = user;
                state.token = token;
                state.isAuthenticated = true;

                localStorage.setItem(
                    "humagraph_token",
                    token
                );

                localStorage.setItem(
                    "humagraph_user",
                    JSON.stringify(user)
                );
            })

            .addCase(login.rejected, (state, action) => {

                state.loading = false;

                state.error =
                    action.payload ||
                    "Login failed";

                state.isAuthenticated = false;
            });


        // =========================
        // REGISTER
        // =========================

        builder
            .addCase(registerUser.pending, (state) => {

                state.loading = true;
                state.error = null;
            })

            .addCase(registerUser.fulfilled, (state, action) => {

                state.loading = false;
                state.error = null;

                const { user, token } = action.payload;

                state.user = user;
                state.token = token;
                state.isAuthenticated = true;

                localStorage.setItem(
                    "humagraph_token",
                    token
                );

                localStorage.setItem(
                    "humagraph_user",
                    JSON.stringify(user)
                );
            })

            .addCase(registerUser.rejected, (state, action) => {

                state.loading = false;

                state.error =
                    action.payload ||
                    "Registration failed";

                state.isAuthenticated = false;
            });
    },
});


export const {
    logout,
    loginSuccess
} = authSlice.actions;


export default authSlice.reducer;