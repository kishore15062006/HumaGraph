import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../src/components/layout/Navbar";
import ErrorHandler from "../src/components/ErrorHandler";
import NotificationStack from "../src/components/NotificationStack";

import Login from "../src/components/Login";
import Register from "../src/components/Register";

function App() {

    return (
        <BrowserRouter>

            {/* Global Navbar */}
            <Navbar />

            {/* Global Error Handler */}
            <ErrorHandler />

            {/* Global Notifications */}
            <NotificationStack />

            {/* Application Routes */}
            <Routes>

                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Temporary Home */}
                <Route
                    path="/"
                    element={
                        <div>
                            <h1>Welcome to HumaGraph</h1>
                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;