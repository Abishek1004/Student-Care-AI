import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import authService from "../api/authService";
import { useAuth } from "../context/AuthContext";
import LoadingDots from "./LoadingDots";
import "./LoginCard.css";

export default function AuthCard({ onClose, initialMode = "login" }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState(initialMode);
  
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Auto-verify when 6 digits are filled
  useEffect(() => {
    const otp = otpDigits.join("");
    if (otp.length === 6 && mode === "register" && otpSent && !loading && !isVerified) {
      handleAutoVerify(otp);
    }
  }, [otpDigits]);

  const handleAutoVerify = async (otp) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await authService.verifyOtp(formData.email, otp);
      if (response.success) {
        setIsVerified(true);
        setMessage("Account verified! You can now login.");
        setTimeout(() => {
          setOtpSent(false);
          setOtpDigits(Array(6).fill(""));
          setMode("login");
          setIsVerified(false);
        }, 1500);
      } else {
        setMessage(response.message || "Invalid OTP");
        setOtpDigits(Array(6).fill("")); // Clear on failure?
        document.getElementById("otp-0").focus();
      }
    } catch (error) {
      setMessage(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const otp = otpDigits.join("");

    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (mode === "register" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (mode === "register") {
      if (otpSent && otp.length !== 6) {
        newErrors.otp = "Please enter the complete 6-digit OTP";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    setMessage("");
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your full name";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) newErrors.password = "Please enter your password";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData.name, formData.email, formData.password);
      setMessage(response.message || "OTP sent successfully");
      setOtpSent(true);
    } catch (error) {
      setMessage(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);
    if (mode === "login") {
      try {
        const response = await authService.login(formData.email, formData.password);
        if (response.success) {
          login(response.data);
          setMessage("Login successful!");
          setTimeout(() => {
            if (onClose) {
              onClose();
            } else {
              navigate("/");
            }
          }, 1000);
        } else {
          setMessage(response.message);
        }
      } catch (error) {
        setMessage(error.message || "Login failed");
      } finally {
        setLoading(false);
      }
    } else {
      const otp = otpDigits.join("");
      try {
        const response = await authService.verifyOtp(formData.email, otp);
        if (response.success) {
          setIsVerified(true);
          setMessage("Account verified! You can now login.");
          setTimeout(() => {
            setOtpSent(false);
            setOtpDigits(Array(6).fill(""));
            setMode("login");
            setIsVerified(false);
          }, 1500);
        } else {
          setMessage(response.message);
        }
      } catch (error) {
        setMessage(error.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    const newMode = mode === "login" ? "register" : "login";
    setMode(newMode);
    setErrors({});
    setMessage("");
    };

  const cardContent = (
    <div className="login-card-container">
      <div className="login-card">
        <button
          className="close-btn"
          onClick={() => {
            if (onClose) onClose();
            else navigate("/");
          }}
        >
          <X size={24} />
        </button>

        <h1 className="login-title">
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        {message && (
          <div className={`form-message ${message.toLowerCase().includes("failed") || message.toLowerCase().includes("error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={loading}
                />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            {mode === "register" ? (
              <div className="email-group">
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading || otpSent}
                  />
                </div>
                {!otpSent && (
                    <button
                      type="button"
                      className="send-otp-btn"
                      onClick={handleSendOTP}
                      disabled={loading}
                    >
                      {loading ? <LoadingDots compact /> : "Send OTP"}
                    </button>
                )}
              </div>
            ) : (
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            )}
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {mode === "register" && otpSent && (
            <div className="form-group otp-field">
              <label>Enter 6-Digit Verification Code</label>
              <div className="otp-boxes">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    placeholder=" "
                    className={`otp-digit ${digit ? 'filled' : ''} ${isVerified ? 'success' : ''}`}
                    value={digit}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        document.getElementById(`otp-${index - 1}`).focus();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      const newOtp = [...otpDigits];
                      newOtp[index] = val;
                      setOtpDigits(newOtp);

                      if (val && index < 5) {
                        document.getElementById(`otp-${index + 1}`).focus();
                      }
                    }}
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {errors.otp && <span className="error-text">{errors.otp}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Only show the main button if not in OTP auto-verify mode or on error */}
          {(mode === "login" || !otpSent) && (
            <button type="submit" className="submit-btn" style={{ marginTop: "15px", display: "flex", justifyContent: "center" }} disabled={loading}>
              {loading ? <LoadingDots compact /> : (mode === "login" ? "Login" : "Register")}
            </button>
          )}

          {mode === "register" && otpSent && (
            <div className="otp-auto-status" style={{ textAlign: "center", marginTop: "15px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
               {loading && <LoadingDots compact />}
            </div>
          )}
        </form>

        <div className="mode-toggle">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <span className="link-text" onClick={toggleMode}>
                Register
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span className="link-text" onClick={toggleMode}>
                Login
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div className="auth-modal-overlay">
        {cardContent}
      </div>
    );
  }

  return cardContent;
}
