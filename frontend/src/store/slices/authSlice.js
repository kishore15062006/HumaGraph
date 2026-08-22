import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:8080/api";

// =====================================================
// LOGIN
// =====================================================

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data?.error || data?.message || "Login failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to connect to server");
    }
  }
);

// =====================================================
// REGISTER
// =====================================================

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data?.error || data?.message || "Registration failed"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to connect to server");
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  user: JSON.parse(localStorage.getItem("humagraph_user")) || null,

  token: localStorage.getItem("humagraph_token") || null,

  loading: false,

  error: null,
};

// =====================================================
// AUTH SLICE
// =====================================================

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
    },
  },

  // =================================================
  // ASYNC THUNKS
  // =================================================

  extraReducers: (builder) => {
    // =============================================
    // LOGIN
    // =============================================

    builder

      .addCase(login.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        /*
         * Adjust these two lines if your backend
         * returns a different JSON structure.
         */

        state.token = action.payload.token;

        state.user = action.payload.user;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Login failed";
      });

    // =============================================
    // REGISTER
    // =============================================

    builder

      .addCase(registerUser.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        /*
         * If registration returns user/token,
         * store them.
         */

        if (action.payload?.token) {
          state.token = action.payload.token;
        }

        if (action.payload?.user) {
          state.user = action.payload.user;
        }
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Registration failed";
      });
  },
});

// =====================================================
// EXPORT
// =====================================================

export const { logout } = authSlice.actions;

export default authSlice.reducer;
