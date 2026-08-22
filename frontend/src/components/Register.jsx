import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../store/slices/authSlice";
import "./Register.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    role: "INDIVIDUAL",
  });

  useEffect(() => {
    if (auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const errorMessage =
    typeof auth.error === "string"
      ? auth.error
      : auth.error
      ? JSON.stringify(auth.error)
      : "";

  return (
    <div className="register-page">
      {/* =========================
                BRAND SECTION
            ========================= */}

      <div className="register-brand-section">
        <div className="register-brand-content">
          <div className="register-brand-logo">
            <div className="register-logo-icon">+</div>

            <span>HumaGraph</span>
          </div>

          <div className="register-brand-message">
            <h1>
              Start your
              <br />
              <span>health journey.</span>
            </h1>

            <p>
              Create your HumaGraph account and take control of your health
              data, goals, and progress.
            </p>
          </div>
        </div>
      </div>

      {/* =========================
                REGISTER FORM
            ========================= */}

      <div className="register-form-section">
        <div className="register-container">
          {/* Mobile Logo */}

          <div className="register-mobile-logo">
            <div className="register-brand-logo">
              <div className="register-logo-icon">+</div>

              <span>HumaGraph</span>
            </div>
          </div>

          {/* Header */}

          <div className="register-header">
            <h2>Create Account</h2>

            <p>Join HumaGraph and start managing your health journey.</p>
          </div>

          {/* Error */}

          {errorMessage && (
            <div className="register-error-message">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}

            <div className="register-form-group">
              <label htmlFor="fullName">Full Name</label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}

            <div className="register-form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}

            <div className="register-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder=""
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Date of Birth */}

            <div className="register-form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>

              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            {/* Account Type */}

            <div className="register-form-group">
              <label htmlFor="role">Account Type</label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="INDIVIDUAL">Individual / Patient</option>

                <option value="PRACTITIONER">Health Practitioner</option>
              </select>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="register-button"
              disabled={auth.loading}
            >
              {auth.loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}

          <div className="register-login-link">
            <span>Already have an account?</span>

            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
