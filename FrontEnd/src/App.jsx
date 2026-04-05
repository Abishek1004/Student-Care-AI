import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import HealthCheck from "./pages/HealthCheck";
import Medicine from "./pages/Medicine";
import Tools from "./pages/Tools";
import Community from "./pages/Community";
import Professionals from "./pages/Professionals";
import AuthCard from "./components/AuthCard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WellnessScore from "./pages/WellnessScore";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";

function App() {
  const { showLoginModal, modalMode, closeLoginModal, openLoginModal } = useAuth();

  return (
    <>
      <Navbar onLoginClick={openLoginModal} />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/advice" element={<HealthCheck />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/community" element={<Community />} />
        <Route path="/professionals" element={<Professionals />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wellness-score" element={<WellnessScore />} />
      </Routes>

      {showLoginModal && (
        <AuthCard initialMode={modalMode} onClose={closeLoginModal} />
      )}

      <Footer />
    </>
  );
}

export default App;