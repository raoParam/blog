import axiosInstance from "./axiosInstance";

export const feedService = {
  getForYouFeed: async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get("/post/posts", { params: { page, limit } });
    return response.data;
  },

  getTrendingFeed: async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get("/post/trending", { params: { page, limit } });
    return response.data;
  },

  getFollowingFeed: async ({ page = 1, limit = 10 } = {}) => {
    const response = await axiosInstance.get("/post/following", { params: { page, limit } });
    return response.data;
  },

  getCategoryFeed: async ({ category, page = 1, limit = 10 }) => {
    const response = await axiosInstance.get(`/post/category/${encodeURIComponent(category)}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosInstance.get("/post/categories");
    return response.data;
  },

  toggleLike: async (postId) => {
    const response = await axiosInstance.post(`/post/${postId}/like`);
    return response.data;
  },

  savePost: async (postId) => {
    const response = await axiosInstance.post(`/user/save/${postId}`);
    return response.data;
  },

  unsavePost: async (postId) => {
    const response = await axiosInstance.delete(`/user/unsave/${postId}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await axiosInstance.get(`/post/${postId}`);
    return response.data;
  },

  getComments: async (postId, { page = 1, limit = 50 } = {}) => {
    const response = await axiosInstance.get(`/post/${postId}/comments`, { params: { page, limit } });
    return response.data;
  },

  addComment: async (postId, content) => {
    const response = await axiosInstance.post(`/post/${postId}/comments`, { content });
    return response.data;
  },

  updatePost: async (postId, { title, content, excerpt }) => {
    const response = await axiosInstance.put(`/post/${postId}`, { title, content, excerpt });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/post/${postId}`);
    return response.data;
  },

  createPost: async ({ title, excerpt, content, visibility = "public", images = [] }) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("excerpt", excerpt || "");
    formData.append("content", content);
    formData.append("visibility", visibility);

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosInstance.post("/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
