import { endpoints } from "./apiConfig";

const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(endpoints.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  register: async (name, email, password) => {
    try {
      const response = await fetch(endpoints.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  sendOtp: async (email, name = null) => {
    try {
      const response = await fetch(endpoints.auth.sendOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  verifyOtp: async (email, otp) => {
    try {
      const response = await fetch(endpoints.auth.verifyOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
