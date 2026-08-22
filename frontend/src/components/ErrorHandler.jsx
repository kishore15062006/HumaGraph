import React from "react";
import { useSelector } from "react-redux";

const ErrorHandler = () => {

    // Read global error state from Redux.
    // Currently this component does not display anything.
    const authError = useSelector((state) => state.auth?.error);

    // Reserved for future global error handling.
    // Example:
    // if (authError) {
    //     console.error("Global Error:", authError);
    // }

    return null;
};

export default ErrorHandler;