import axiosInstance from "./axiosInstance";

export const publicService = {
  // Get categories for trending topics
  getCategories: async () => {
    const response = await axiosInstance.get("/public/categories");
    return response.data;
  },

  // Get public posts for blog preview
  getPosts: async () => {
    const response = await axiosInstance.get("/public/posts");
    return response.data;
  },
};
