import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalMode, setModalMode] = useState("login");

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setShowLoginModal(false); // Close modal on successful login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const openLoginModal = (mode = "login") => {
    setModalMode(mode);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, isAuthenticated: !!user,
      showLoginModal, setShowLoginModal, modalMode, setModalMode,
      openLoginModal, closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
