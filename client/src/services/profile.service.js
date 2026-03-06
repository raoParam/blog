import axiosInstance from "./axiosInstance";

export const profileService = {
  getMyProfile: async () => {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  },

  getMyPosts: async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/user/posts", { params: { page, limit } });
    return response.data;
  },

  getSavedPosts: async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get("/user/saved", { params: { page, limit } });
    return response.data;
  },

  getFollowers: async ({ page = 1, limit = 20, userId } = {}) => {
    const response = await axiosInstance.get("/user/followers", { params: { page, limit, userId } });
    return response.data;
  },

  getFollowing: async ({ page = 1, limit = 20, userId } = {}) => {
    const response = await axiosInstance.get("/user/following", { params: { page, limit, userId } });
    return response.data;
  },

  getUserProfile: async (username) => {
    const response = await axiosInstance.get(`/user/${encodeURIComponent(username)}`);
    return response.data;
  },

  getUserPosts: async (username, { page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get(`/user/${encodeURIComponent(username)}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  followUser: async (userId) => {
    const response = await axiosInstance.post(`/user/follow/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await axiosInstance.delete(`/user/unfollow/${userId}`);
    return response.data;
  },

  unsavePost: async (postId) => {
    const response = await axiosInstance.delete(`/user/unsave/${postId}`);
    return response.data;
  },

  updateProfile: async ({ firstName, lastName, bio, avatarFile }) => {
    const formData = new FormData();
    if (typeof firstName === "string") formData.append("firstName", firstName);
    if (typeof lastName === "string") formData.append("lastName", lastName);
    if (typeof bio === "string") formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    const response = await axiosInstance.patch("/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
