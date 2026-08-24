import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import healthReadingsReducer from "./slices/healthReadingSlice";
import healthGoalsReducer from "./slices/healthGoalSlice";
import practitionerGrantsReducer from "./slices/practitionerGrantSlice";

export const index = configureStore({
    reducer: {
        auth: authReducer,
        healthReadings: healthReadingsReducer,
        healthGoals: healthGoalsReducer,
        practitionerGrants: practitionerGrantsReducer,
    },
});

export { index };
export default index;

