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

            {/* Gloimport React, { useEffect, useMemo, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import ErrorHandler from "./components/ErrorHandler";
import NotificationStack from "./components/NotificationStack";

import Login from "./components/Login";
import Register from "./components/Register";

import AdminDashboard from "./components/AdminDashboard";

import api from "./services/api";

import "./App.css";


// =====================================================
// PRIVATE ROUTE
// =====================================================

const PrivateRoute = ({ children }) => {

    const auth = useSelector((state) => state.auth);

    if (!auth.user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};


// =====================================================
// HELPER
// =====================================================

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};


// =====================================================
// HEALTH TRENDS GRAPH
// =====================================================

const HealthTrendsGraph = ({ goalFactor }) => {

    const [summary, setSummary] = useState([]);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        let mounted = true;

        const fetchSummary = async () => {

            try {

                setLoading(true);

                const response =
                    await api.get("/readings/summary");

                if (mounted) {

                    const data =
                        Array.isArray(response.data)
                            ? response.data
                            : response.data?.content || [];

                    setSummary(data);
                }

            } catch (error) {

                console.error(
                    "Failed to fetch health summary:",
                    error
                );

                if (mounted) {
                    setSummary([]);
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        fetchSummary();

        return () => {
            mounted = false;
        };

    }, [goalFactor]);


    // =================================================
    // CALCULATE COMPOSITE SCORES
    // =================================================

    const chartData = useMemo(() => {

        return summary.map((item) => {

            const avgValue =
                Number(
                    item.averageValue ??
                    item.avgValue ??
                    item.average ??
                    item.value ??
                    0
                );

            const readingScore = clamp(
                100 - Math.abs(avgValue - 72) * 2,
                0,
                100
            );

            const compositeScore =
                readingScore * 0.7 +
                goalFactor * 100 * 0.3;

            return {
                date:
                    item.date ??
                    item.recordedDate ??
                    "",

                averageValue: avgValue,

                readingScore,

                score: Math.round(
                    clamp(compositeScore, 0, 100)
                )
            };

        });

    }, [summary, goalFactor]);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <section className="dashboard-card trends-card">

                <div className="card-header">

                    <div>
                        <p className="card-eyebrow">
                            HEALTH TRENDS
                        </p>

                        <h2>
                            Daily Health Consistency
                        </h2>
                    </div>

                    <span className="status-badge status-green">
                        Target 72 BPM
                    </span>

                </div>

                <div className="chart-loading">
                    <div className="loading-spinner"></div>

                    <span>
                        Generating health insights
                    </span>
                </div>

            </section>
        );
    }


    // =================================================
    // NO DATA
    // =================================================

    if (chartData.length === 0) {

        return (
            <section className="dashboard-card trends-card">

                <div className="card-header">

                    <div>
                        <p className="card-eyebrow">
                            HEALTH TRENDS
                        </p>

                        <h2>
                            Daily Health Consistency
                        </h2>
                    </div>

                    <span className="status-badge status-green">
                        Target 72 BPM
                    </span>

                </div>

                <div className="chart-empty">

                    <div className="empty-chart-icon">
                        ♥
                    </div>

                    <p>
                        No heart rate data available for analysis
                    </p>

                </div>

            </section>
        );
    }


    // =================================================
    // SVG CHART
    // =================================================

    const width = 760;

    const height = 300;

    const paddingLeft = 48;

    const paddingRight = 25;

    const paddingTop = 30;

    const paddingBottom = 48;

    const chartWidth =
        width - paddingLeft - paddingRight;

    const chartHeight =
        height - paddingTop - paddingBottom;


    const getX = (index) => {

        if (chartData.length === 1) {
            return paddingLeft + chartWidth / 2;
        }

        return (
            paddingLeft +
            (index / (chartData.length - 1)) *
            chartWidth
        );
    };


    const getY = (score) => {

        return (
            paddingTop +
            ((100 - score) / 100) *
            chartHeight
        );
    };


    const points = chartData
        .map((item, index) => {

            return `${getX(index)},${getY(item.score)}`;

        })
        .join(" ");


    const areaPoints =
        `${paddingLeft},${paddingTop + chartHeight} ` +
        points +
        ` ${getX(chartData.length - 1)},${paddingTop + chartHeight}`;


    const gridValues = [0, 25, 50, 75, 100];


    return (
        <section className="dashboard-card trends-card">

            <div className="card-header">

                <div>

                    <p className="card-eyebrow">
                        HEALTH TRENDS
                    </p>

                    <h2>
                        Daily Health Consistency
                    </h2>

                    <p className="card-description">
                        A combined view of reading stability
                        and goal progress.
                    </p>

                </div>

                <span className="status-badge status-green">
                    Target 72 BPM
                </span>

            </div>


            <div className="chart-wrapper">

                <svg
                    className="health-chart"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                >

                    <defs>

                        <linearGradient
                            id="healthAreaGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stopColor="#22c55e"
                                stopOpacity="0.28"
                            />

                            <stop
                                offset="100%"
                                stopColor="#22c55e"
                                stopOpacity="0.02"
                            />

                        </linearGradient>

                    </defs>


                    {/* SAFE ZONE */}

                    <rect
                        x={paddingLeft}
                        y={getY(100)}
                        width={chartWidth}
                        height={getY(70) - getY(100)}
                        className="safe-zone"
                    />


                    {/* GRID */}

                    {gridValues.map((value) => {

                        const y = getY(value);

                        return (
                            <g key={value}>

                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={paddingLeft + chartWidth}
                                    y2={y}
                                    className="chart-grid-line"
                                />

                                <text
                                    x={paddingLeft - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="chart-axis-label"
                                >
                                    {value}
                                </text>

                            </g>
                        );

                    })}


                    {/* AREA */}

                    <polygon
                        points={areaPoints}
                        className="chart-area"
                    />


                    {/* LINE */}

                    <polyline
                        points={points}
                        className="chart-line"
                    />


                    {/* DATA POINTS */}

                    {chartData.map((item, index) => {

                        const x = getX(index);

                        const y = getY(item.score);

                        return (
                            <g key={`${item.date}-${index}`}>

                                <circle
                                    cx={x}
                                    cy={y}
                                    r="5"
                                    className="chart-point"
                                />

                                <text
                                    x={x}
                                    y={y - 12}
                                    textAnchor="middle"
                                    className="chart-score-label"
                                >
                                    {item.score}
                                </text>

                            </g>
                        );

                    })}


                    {/* DATE LABELS */}

                    {chartData.map((item, index) => {

                        const x = getX(index);

                        const rawDate =
                            item.date;

                        let label = rawDate;

                        if (rawDate) {

                            const parsed =
                                new Date(rawDate);

                            if (
                                !Number.isNaN(
                                    parsed.getTime()
                                )
                            ) {

                                label =
                                    parsed.toLocaleDateString(
                                        "en-US",
                                        {
                                            month: "short",
                                            day: "numeric"
                                        }
                                    );

                            }

                        }

                        return (
                            <text
                                key={`date-${index}`}
                                x={x}
                                y={height - 15}
                                textAnchor="middle"
                                className="chart-date-label"
                            >
                                {label}
                            </text>
                        );

                    })}

                </svg>

            </div>

        </section>
    );
};


// =====================================================
// INDIVIDUAL DASHBOARD
// =====================================================

const IndividualDashboard = ({ user }) => {

    const [goalSummary, setGoalSummary] =
        useState(null);

    const [goalLoading, setGoalLoading] =
        useState(true);


    useEffect(() => {

        let mounted = true;

        const fetchGoalSummary = async () => {

            try {

                setGoalLoading(true);

                const response =
                    await api.get("/goals/progress");

                if (mounted) {

                    setGoalSummary(response.data);

                }

            } catch (error) {

                console.error(
                    "Failed to fetch goal summary:",
                    error
                );

                if (mounted) {

                    setGoalSummary({
                        totalGoals: 0,
                        achievedGoals: 0,
                        averageProgress: 0
                    });

                }

            } finally {

                if (mounted) {
                    setGoalLoading(false);
                }

            }

        };

        fetchGoalSummary();

        return () => {
            mounted = false;
        };

    }, []);


    const total =
        goalSummary?.totalGoals ?? 0;

    const achieved =
        goalSummary?.achievedGoals ?? 0;

    const averageProgress =
        clamp(
            Number(
                goalSummary?.averageProgress ?? 0
            ),
            0,
            1
        );


    const percentage =
        Math.round(
            averageProgress * 100
        );


    return (
        <main className="dashboard-page">

            {/* =========================================
                HERO
            ========================================= */}

            <section className="dashboard-hero">

                <div>

                    <p className="hero-eyebrow">
                        PERSONAL HEALTH OVERVIEW
                    </p>

                    <h1>
                        Welcome back, {user.fullName}
                    </h1>

                    <p className="hero-subtitle">
                        Your health metrics and goals
                        are being monitored.
                    </p>

                </div>

            </section>


            {/* =========================================
                DASHBOARD GRID
            ========================================= */}

            <section className="dashboard-grid">

                {/* =====================================
                    HEALTH TRENDS
                ===================================== */}

                <HealthTrendsGraph
                    goalFactor={averageProgress}
                />


                {/* =====================================
                    GOAL PROGRESS
                ===================================== */}

                <section className="dashboard-card goal-card">

                    <div className="card-header">

                        <div>

                            <p className="card-eyebrow">
                                GOALS
                            </p>

                            <h2>
                                Goal Progress
                            </h2>

                        </div>

                        <div className="goal-icon">
                            ✓
                        </div>

                    </div>


                    {goalLoading ? (

                        <div className="goal-loading">

                            <div className="loading-spinner"></div>

                            <span>
                                Loading goals...
                            </span>

                        </div>

                    ) : (

                        <>

                            <div className="goal-percentage">

                                <span>
                                    {percentage}%
                                </span>

                                <small>
                                    overall achievement
                                </small>

                            </div>


                            <div className="progress-track">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${percentage}%`
                                    }}
                                />

                            </div>


                            <div className="goal-footer">

                                <span>
                                    {achieved} of {total} goals reached.
                                </span>

                                <span className="goal-status">
                                    {total === 0
                                        ? "No goals yet"
                                        : `${percentage}%`
                                    }
                                </span>

                            </div>

                        </>

                    )}

                </section>

            </section>

        </main>
    );
};


// =====================================================
// HOME / DASHBOARD
// =====================================================

const Dashboard = () => {

    const auth = useSelector(
        (state) => state.auth
    );

    const user = auth.user;


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    // ================================================
    // ADMIN
    // ================================================

    if (user.role === "ADMIN") {

        return <AdminDashboard />;
    }


    // ================================================
    // INDIVIDUAL
    // ================================================

    if (user.role === "INDIVIDUAL") {

        return (
            <IndividualDashboard
                user={user}
            />
        );
    }


    // ================================================
    // PRACTITIONER
    // ================================================

    if (user.role === "PRACTITIONER") {

        return (
            <main className="dashboard-page">

                <section className="dashboard-hero">

                    <div>

                        <p className="hero-eyebrow">
                            PRACTITIONER PORTAL
                        </p>

                        <h1>
                            Welcome back,{" "}
                            {user.fullName ||
                                user.email}
                        </h1>

                        <p className="hero-subtitle">
                            Manage your patients and
                            monitor their health data.
                        </p>

                    </div>

                </section>

            </main>
        );
    }


    return null;
};


// =====================================================
// APP
// =====================================================

function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <ErrorHandler />

            <NotificationStack />


            <Routes>

                {/* =====================================
                    PUBLIC ROUTES
                ===================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =====================================
                    DASHBOARD
                ===================================== */}

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />


                {/* =====================================
                    FUTURE ROUTES
                ===================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;bal Navbar */}
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