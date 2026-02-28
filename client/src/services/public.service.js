import axiosInstance from "./axiosInstance";

export const publicService = {
  // Get categories for trending topics
  getCategories: async () => {
    try {
      const response = await axiosInstance.get("/public/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get public posts for blog preview
  getPosts: async () => {
    try {
      const response = await axiosInstance.get("/public/posts");
      return response.data;
    } catch (error) {
      console.error("Error fetching public posts:", error);
      throw error;
    }
  },
};