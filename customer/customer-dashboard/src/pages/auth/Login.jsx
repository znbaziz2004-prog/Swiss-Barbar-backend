import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/customer-auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Login failed. Please try again."
        );
      }

      const data = response.data;

      const token =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.data?.accessToken;

      const user = data.user || data.customer || data.data?.user || data.data;

      if (!token) {
        throw new Error("Login successful but no login token was returned.");
      }

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("swiss_barber_customer_token", token);

      if (user) {
        storage.setItem(
          "swiss_barber_customer_user",
          JSON.stringify(user)
        );
      }

      navigate("/customer/dashboard");
    } catch (error) {
      console.error("Customer login error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to login. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-auth-page">
      <div className="auth-background-glow glow-one"></div>
      <div className="auth-background-glow glow-two"></div>

      <div className="auth-container">
        {/* Left Side */}
        <div className="auth-brand-section">
          <div className="brand-logo">
            <span className="logo-mark">S</span>
            <span>Swiss Barber</span>
          </div>

          <div className="brand-content">
            <span className="brand-badge">CUSTOMER PORTAL</span>

            <h1>
              Your style.
              <br />
              <span>Your schedule.</span>
            </h1>

            <p>
              Manage your appointments, discover your booking history,
              and keep your Swiss Barber experience in one place.
            </p>

            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">✓</div>

                <div>
                  <strong>Easy booking</strong>
                  <span>Book your next appointment in seconds.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">◷</div>

                <div>
                  <strong>Manage appointments</strong>
                  <span>View, reschedule or cancel your bookings.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">◆</div>

                <div>
                  <strong>Your profile</strong>
                  <span>Keep your customer information up to date.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span>© 2026 Swiss Barber</span>
            <span>Premium Barber Experience</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-form-section">
          <div className="login-card">
            <div className="mobile-logo">
              <span className="logo-mark">S</span>
              <span>Swiss Barber</span>
            </div>

            <div className="form-header">
              <span className="welcome-label">WELCOME BACK</span>

              <h2>Sign in to your account</h2>

              <p>
                Enter your email and password to access your customer
                dashboard.
              </p>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon">@</span>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => {
                      setError(
                        "Password reset will be available soon."
                      );
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <span className="input-icon">●</span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={loading}
                />

                <span>Remember me</span>
              </label>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>{loading ? "Signing in..." : "Sign in"}</span>

                <span className="button-arrow">
                  {loading ? "..." : "→"}
                </span>
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="register-text">
              Don't have a customer account?

              <button
                type="button"
                onClick={() => {
                  setError(
                    "Customer registration will be available soon."
                  );
                }}
              >
                Create account
              </button>
            </div>

            <div className="security-note">
              <span className="security-icon">✓</span>

              <span>
                Your account information is securely protected.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;