const rawBaseUrl =
  import.meta.env.VITE_API_URL || "https://blog-6isi.onrender.com";

const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

export const API_URL = `${API_BASE_URL}/api`;

export default API_BASE_URL;
