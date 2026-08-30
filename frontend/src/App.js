import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useSelector } from "react-redux";

// Layout
import Navbar from "./components/layout/Navbar";

// Common
import ErrorHandler from "./components/ErrorHandler";

// Authentication
import Login from "./components/Login";
import Register from "./components/Register";

// Dashboards
import AdminDashboard from "./components/dashboard/AdminDashboard";

// Individual
import HealthReadingList from "./components/healthReading/HealthReadingList";
import HealthGoalList from "./components/healthGoal/HealthGoalList";

// Practitioner
import PractitionerGrantList from "./components/practitionerGrant/PractitionerGrantList";

// Styles
import "./App.css";

// ============================================================
// AUTHENTICATION
// ============================================================

const PrivateRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ============================================================
// ROLE ROUTE
// ============================================================

const RoleRoute = ({ allowedRoles, children }) => {
  const auth = useSelector((state) => state.auth);

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  const role = auth.user.role;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  const auth = useSelector((state) => state.auth);

  const user = auth?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ADMIN
  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  // INDIVIDUAL
  if (user.role === "INDIVIDUAL") {
    return <IndividualDashboard user={user} />;
  }

  // PRACTITIONER
  if (user.role === "PRACTITIONER") {
    return <PractitionerDashboard user={user} />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Welcome</h1>
        <p>Your account role is not configured correctly.</p>
      </div>
    </div>
  );
};

// ============================================================
// INDIVIDUAL DASHBOARD
// ============================================================

const IndividualDashboard = ({ user }) => {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="hero-eyebrow">PERSONAL HEALTH OVERVIEW</p>

          <h1>Welcome back, {user?.fullName || user?.email}</h1>

          <p className="hero-subtitle">
            Monitor your health readings, goals and progress.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <DashboardNavigationCard
          title="Health Readings"
          description="View and manage your biometric health measurements."
          link="/health-readings"
          icon="♥"
        />

        <DashboardNavigationCard
          title="Health Goals"
          description="Create, monitor and manage your personal health goals."
          link="/health-goals"
          icon="✓"
        />

        <DashboardNavigationCard
          title="Practitioner Access"
          description="Manage practitioners who have access to your health information."
          link="/practitioner-grants"
          icon="⚕"
        />
      </section>
    </main>
  );
};

// ============================================================
// PRACTITIONER DASHBOARD
// ============================================================

const PractitionerDashboard = ({ user }) => {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="hero-eyebrow">PRACTITIONER PORTAL</p>

          <h1>Welcome back, {user?.fullName || user?.email}</h1>

          <p className="hero-subtitle">
            Manage patients and monitor authorized health data.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <DashboardNavigationCard
          title="Patient Access"
          description="View and manage patients who have granted you access."
          link="/practitioner/grants"
          icon="👥"
        />

        <DashboardNavigationCard
          title="Patient Readings"
          description="Review health readings shared by your patients."
          link="/practitioner/readings"
          icon="♥"
        />

        <DashboardNavigationCard
          title="Clinical Notes"
          description="Manage clinical notes associated with patient access."
          link="/practitioner/notes"
          icon="📝"
        />
      </section>
    </main>
  );
};

// ============================================================
// DASHBOARD NAVIGATION CARD
// ============================================================

const DashboardNavigationCard = ({ title, description, link, icon }) => {
  return (
    <div className="dashboard-card navigation-card">
      <div className="navigation-card-icon">{icon}</div>

      <div>
        <h2>{title}</h2>

        <p>{description}</p>

        <a href={link} className="primary-health-button">
          Open
        </a>
      </div>
    </div>
  );
};

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <ErrorHandler />

      <Routes>
        {/* ====================================================
            PUBLIC
        ==================================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* ====================================================
            COMMON PRIVATE DASHBOARD
        ==================================================== */}

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ====================================================
            INDIVIDUAL - HEALTH READINGS
        ==================================================== */}

        <Route
          path="/health-readings"
          element={
            <RoleRoute allowedRoles={["INDIVIDUAL"]}>
              <HealthReadingList />
            </RoleRoute>
          }
        />

        {/* ====================================================
            INDIVIDUAL - HEALTH GOALS
        ==================================================== */}

        <Route
          path="/health-goals"
          element={
            <RoleRoute allowedRoles={["INDIVIDUAL"]}>
              <HealthGoalList />
            </RoleRoute>
          }
        />

        {/* ====================================================
            INDIVIDUAL - PRACTITIONER GRANTS
        ==================================================== */}

        <Route
          path="/practitioner-grants"
          element={
            <RoleRoute allowedRoles={["INDIVIDUAL"]}>
              <PractitionerGrantList />
            </RoleRoute>
          }
        />

        {/* ====================================================
            PRACTITIONER - GRANTS
        ==================================================== */}

        <Route
          path="/practitioner/grants"
          element={
            <RoleRoute allowedRoles={["PRACTITIONER"]}>
              <PractitionerGrantList />
            </RoleRoute>
          }
        />

        {/* ====================================================
            PRACTITIONER - READINGS
        ==================================================== */}

        <Route
          path="/practitioner/readings"
          element={
            <RoleRoute allowedRoles={["PRACTITIONER"]}>
              <PractitionerReadings />
            </RoleRoute>
          }
        />

        {/* ====================================================
            PRACTITIONER - NOTES
        ==================================================== */}

        <Route
          path="/practitioner/notes"
          element={
            <RoleRoute allowedRoles={["PRACTITIONER"]}>
              <PractitionerNotes />
            </RoleRoute>
          }
        />

        {/* ====================================================
            ADMIN
        ==================================================== */}

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* ====================================================
            UNKNOWN URL
        ==================================================== */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================================
// TEMPORARY PRACTITIONER READINGS PAGE
// ============================================================

const PractitionerReadings = () => {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="hero-eyebrow">PATIENT HEALTH DATA</p>

          <h1>Patient Readings</h1>

          <p className="hero-subtitle">
            Review health readings shared by your patients.
          </p>
        </div>
      </section>

      <section className="dashboard-card">
        <h2>Patient readings</h2>

        <p>
          Select a patient from your authorized patient list to view their
          health readings.
        </p>
      </section>
    </main>
  );
};

// ============================================================
// TEMPORARY PRACTITIONER NOTES PAGE
// ============================================================

const PractitionerNotes = () => {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="hero-eyebrow">CLINICAL MANAGEMENT</p>

          <h1>Clinical Notes</h1>

          <p className="hero-subtitle">
            Manage clinical notes for authorized patients.
          </p>
        </div>
      </section>

      <section className="dashboard-card">
        <h2>Clinical Notes</h2>

        <p>Patient-specific clinical notes will appear here.</p>
      </section>
    </main>
  );
};

export default App;
