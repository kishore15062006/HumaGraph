import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import practitionerGrantService from "../../services/practitionerGrantService";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

// ========================================
// FETCH GRANTS
// ========================================

export const fetchGrants = createAsyncThunk(
  "practitionerGrants/fetchGrants",
  async (_, { rejectWithValue }) => {
    try {
      return await practitionerGrantService.getAll();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch practitioner grants"
      );
    }
  }
);

// ========================================
// UPDATE GRANT STATUS
// ========================================

export const updateGrantStatus = createAsyncThunk(
  "practitionerGrants/updateGrantStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await practitionerGrantService.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update grant status"
      );
    }
  }
);

// ========================================
// DELETE GRANT
// ========================================

export const deleteGrant = createAsyncThunk(
  "practitionerGrants/deleteGrant",
  async (id, { rejectWithValue }) => {
    try {
      await practitionerGrantService.delete(id);

      // Return ID so reducer knows which grant to remove
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete practitioner grant"
      );
    }
  }
);

// ========================================
// SLICE
// ========================================

const practitionerGrantSlice = createSlice({
  name: "practitionerGrants",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    // ========================================
    // FETCH GRANTS
    // ========================================

    builder
      .addCase(fetchGrants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGrants.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = action.payload;
      })

      .addCase(fetchGrants.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch practitioner grants";
      });

    // ========================================
    // UPDATE STATUS
    // ========================================

    builder
      .addCase(updateGrantStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateGrantStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateGrantStatus.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to update grant status";
      });

    // ========================================
    // DELETE GRANT
    // ========================================

    builder
      .addCase(deleteGrant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteGrant.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(deleteGrant.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to delete practitioner grant";
      });
  },
});

export default practitionerGrantSlice.reducer;
