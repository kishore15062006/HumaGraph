import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../../services/authService";

const getStoredUser = () => {
    const user = localStorage.getItem("humagraph_user");

    if (!user || user === "undefined") {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        localStorage.removeItem("humagraph_user");
        return null;
    }
};

const initialState = {
    user: getStoredUser(),
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
            return await authService.login(credentials);
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
    "auth/registerUser",
    async (dto, { rejectWithValue }) => {
        try {
            return await authService.register(dto);
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
        logout: (state) => {
            localStorage.removeItem("humagraph_token");
            localStorage.removeItem("humagraph_user");

            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },

        loginSuccess: (state, action) => {
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
        },
    },

    extraReducers: (builder) => {

        // LOGIN
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
                    action.payload || "Login failed";
            });


        // REGISTER
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
            });
    },
});


export const {
    logout,
    loginSuccess
} = authSlice.actions;

export default authSlice.reducer;