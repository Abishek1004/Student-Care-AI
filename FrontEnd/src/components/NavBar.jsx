import { NavLink } from "react-router-dom";
import { Search, Activity, User, LogOut } from "lucide-react";
import { FaSignInAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

export default function Navbar(props) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="top-nav">
        <div className="logo">
          <div className="text-logo">Student Care AI</div>
          <Activity color="#e91e63" size={32} className="pulse-icon" strokeWidth={2.5} />
        </div>

        <div className="top-right">
          <div className="signin">
            {isAuthenticated ? (
              <div className="user-profile-nav">
                <div className="user-info">
                  <User size={18} />
                  <span>{user.name}</span>
                </div>
                <button className="logout-btn" onClick={logout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={props.onLoginClick}>
                <FaSignInAlt /> Login
              </button>
            )}
          </div>

          <div className="search-box">
            <input type="text" placeholder="Search" />
            <Search size={18} />
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <NavLink to="/" end className="nav-link dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/advice" className="nav-link health">
          Health Check
        </NavLink>

        <NavLink to="/wellness-score" className="nav-link green">
          Wellness Score
        </NavLink>

        <NavLink to="/tools" className="nav-link blue">
          Tools
        </NavLink>

        <NavLink to="/community" className="nav-link blue">
          Health Tips
        </NavLink>

        <NavLink to="/professionals" className="nav-link blue">
          Medical Professionals
        </NavLink>
      </div>
    </nav>
  );
}