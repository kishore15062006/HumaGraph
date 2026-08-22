import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/slices/authSlice";
import "./Login.css"

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(
        login({
          email,
          password,
        })
      );

      if (login.fulfilled.match(resultAction)) {
        const data = resultAction.payload;

        if (data.token) {
          localStorage.setItem("humagraph_token", data.token);
        }

        if (data.user) {
          localStorage.setItem("humagraph_user", JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const errorMessage =
    typeof auth.error === "string"
      ? auth.error
      : auth.error
      ? JSON.stringify(auth.error)
      : "";

  return (
    <div className="login-page">
      {/* Left Branding Section */}
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="brand-logo-icon">+</div>

            <span>HumaGraph</span>
          </div>

          <div className="brand-message">
            <h1>
              Your health,
              <br />
              <span>understood better.</span>
            </h1>

            <p>
              Track your health, monitor your progress, and stay connected with
              your healthcare practitioners.
            </p>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="login-form-section">
        <div className="login-container">
          <div className="mobile-logo">
            <div className="brand-logo">
              <div className="brand-logo-icon">+</div>

              <span>HumaGraph</span>
            </div>
          </div>

          <div className="login-header">
            <h2>Login</h2>

            <p>Welcome back. Please sign in to your HumaGraph account.</p>
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="****"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-button"
              disabled={auth.loading}
            >
              {auth.loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="register-link">
            <span>Don't have an account?</span>

            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
