import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import healthGoalService from "../../services/healthGoalService";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// ==============================
// FETCH GOALS
// ==============================

export const fetchGoals = createAsyncThunk(
  "healthGoals/fetchGoals",
  async (_, { rejectWithValue }) => {
    try {
      return await healthGoalService.getAll();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch health goals"
      );
    }
  }
);

// ==============================
// CREATE GOAL
// ==============================

export const createGoal = createAsyncThunk(
  "healthGoals/createGoal",
  async (dto, { rejectWithValue }) => {
    try {
      return await healthGoalService.create(dto);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create health goal"
      );
    }
  }
);

// ==============================
// UPDATE GOAL
// ==============================

export const updateGoal = createAsyncThunk(
  "healthGoals/updateGoal",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await healthGoalService.update(id, dto);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update health goal"
      );
    }
  }
);

// ==============================
// DELETE GOAL
// ==============================

export const deleteGoal = createAsyncThunk(
  "healthGoals/deleteGoal",
  async (id, { rejectWithValue }) => {
    try {
      await healthGoalService.delete(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete health goal"
      );
    }
  }
);

// ==============================
// SLICE
// ==============================

const healthGoalSlice = createSlice({
  name: "healthGoals",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    // ------------------------------
    // FETCH
    // ------------------------------

    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = action.payload;
      })

      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch health goals";
      });

    // ------------------------------
    // CREATE
    // ------------------------------

    builder
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items.unshift(action.payload);
      })

      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create health goal";
      });

    // ------------------------------
    // UPDATE
    // ------------------------------

    builder
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update health goal";
      });

    // ------------------------------
    // DELETE
    // ------------------------------

    builder
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete health goal";
      });
  },
});

export default healthGoalSlice.reducer;
