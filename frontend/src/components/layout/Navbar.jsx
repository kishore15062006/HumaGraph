import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import "./Navbar.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useSelector((state) => state.auth);

  // No authenticated user
  if (!auth.user) {
    return null;
  }

  const user = auth.user;
  const role = user.role;

  const displayName = user.fullName || user.email;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      {/* =========================
                LEFT - BRAND
            ========================= */}

      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-icon">+</div>

          <span>HumaGraph</span>
        </Link>

        {/* =========================
                    NAVIGATION
                ========================= */}

        <div className="navbar-links">
          {/* Everyone */}
          <Link
            to="/"
            className={isActive("/") ? "nav-link active" : "nav-link"}
          >
            Home
          </Link>

          {/* Individual */}
          {role === "INDIVIDUAL" && (
            <>
              <Link
                to="/readings"
                className={
                  isActive("/readings") ? "nav-link active" : "nav-link"
                }
              >
                Readings
              </Link>

              <Link
                to="/goals"
                className={isActive("/goals") ? "nav-link active" : "nav-link"}
              >
                Goals
              </Link>

              <Link
                to="/grants"
                className={isActive("/grants") ? "nav-link active" : "nav-link"}
              >
                Access
              </Link>
            </>
          )}

          {/* Practitioner */}
          {role === "PRACTITIONER" && (
            <Link
              to="/grants"
              className={isActive("/grants") ? "nav-link active" : "nav-link"}
            >
              Patients
            </Link>
          )}

          {/* Admin */}
          {role === "ADMIN" && (
            <Link
              to="/admin"
              className={
                location.pathname.startsWith("/admin")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* =========================
                RIGHT SECTION
            ========================= */}

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="navbar-user-info">
            <span className="navbar-welcome">Welcome back!</span>

            <span className="navbar-username">{displayName}</span>
          </div>
        </div>

        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
