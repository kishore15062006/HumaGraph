import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const index = configureStore({
    reducer: {
        auth: authReducer
    }
});

export { index };
export default index;