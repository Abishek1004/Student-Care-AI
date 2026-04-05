const API_BASE_URL = "http://localhost:8080";

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    sendOtp: `${API_BASE_URL}/auth/send-otp`,
    verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  },
  reports: {
    history: (userId) => `${API_BASE_URL}/api/history/${userId}`,
    detail: (id) => `${API_BASE_URL}/api/report/${id}`,
  },
  prediction: {
    predict: `${API_BASE_URL}/api/predict`,
  },
};

export default API_BASE_URL;
