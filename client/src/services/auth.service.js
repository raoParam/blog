import axiosInstance from "./axiosInstance";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authService = {
  login: async ({ emailId, password }) => {
    const response = await axiosInstance.post("/auth/login", { emailId, password });
    return response.data;
  },

  register: async ({ userName, emailId, password }) => {
    const response = await axiosInstance.post("/auth/register", {
      userName,
      emailId,
      password,
    });
    return response.data;
  },

  forgotPassword: async ({ emailId }) => {
    const response = await axiosInstance.post("/auth/forgot-password", { emailId });
    return response.data;
  },

  resetPassword: async ({ emailId, otp, newPassword, confirmPassword }) => {
    const response = await axiosInstance.post("/auth/reset-password", {
      emailId,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  verifyEmail: async ({ emailId, otp }) => {
    const response = await axiosInstance.post("/auth/verify-email", { emailId, otp });
    return response.data;
  },

  resendVerification: async ({ emailId }) => {
    const response = await axiosInstance.post("/auth/resend-otp", { emailId });
    return response.data;
  },

  logout: async ({ refreshToken }) => {
    const response = await axiosInstance.post("/auth/logout", { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  },

  getGoogleAuthUrl: () => `${API_URL}/auth/google`,
};
