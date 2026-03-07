import axiosInstance from "./axiosInstance";

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

  logout: async ({ refreshToken }) => {
    const response = await axiosInstance.post("/auth/logout", { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  },
};
