import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import healthReadingService from "../../services/healthReadingService";

const initialState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: "",
  filterByStatus: "ALL",
};

// ==============================
// FETCH READINGS
// ==============================

export const fetchReadings = createAsyncThunk(
  "healthReadings/fetchReadings",
  async (_, { rejectWithValue }) => {
    try {
      return await healthReadingService.getAll();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch health readings"
      );
    }
  }
);

// ==============================
// CREATE READING
// ==============================

export const createReading = createAsyncThunk(
  "healthReadings/createReading",
  async (dto, { rejectWithValue }) => {
    try {
      return await healthReadingService.create(dto);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create health reading"
      );
    }
  }
);

// ==============================
// UPDATE READING
// ==============================

export const updateReading = createAsyncThunk(
  "healthReadings/updateReading",
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      const response = await healthReadingService.update(id, dto);

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update health reading"
      );
    }
  }
);

// ==============================
// DELETE READING
// ==============================

export const deleteReading = createAsyncThunk(
  "healthReadings/deleteReading",
  async (id, { rejectWithValue }) => {
    try {
      await healthReadingService.delete(id);

      // Return the ID so the reducer knows which
      // reading should be removed.
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete health reading"
      );
    }
  }
);

// ==============================
// SLICE
// ==============================

const healthReadingSlice = createSlice({
  name: "healthReadings",

  initialState,

  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    setFilterByStatus: (state, action) => {
      state.filterByStatus = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ------------------------------
    // FETCH
    // ------------------------------

    builder
      .addCase(fetchReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload;
      })

      .addCase(fetchReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch health readings";
      });

    // ------------------------------
    // CREATE
    // ------------------------------

    builder
      .addCase(createReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createReading.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items.unshift(action.payload);
      })

      .addCase(createReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create health reading";
      });

    // ------------------------------
    // UPDATE
    // ------------------------------

    builder
      .addCase(updateReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateReading.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update health reading";
      });

    // ------------------------------
    // DELETE
    // ------------------------------

    builder
      .addCase(deleteReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteReading.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(deleteReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete health reading";
      });
  },
});

export const { setSearchQuery, setFilterByStatus } = healthReadingSlice.actions;

export default healthReadingSlice.reducer;
