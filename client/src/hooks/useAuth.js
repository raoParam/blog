import { useSelector, useDispatch } from "react-redux";
import { setUser, setLoading, setError, logout } from "../store/slices/authSlice";
import api from "../services/axiosInstance";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post("/auth/login", { emailId: email, password });
      
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      dispatch(setUser(response.data.user));
      return { success: true };
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Login failed"));
      return { success: false, error: err.response?.data?.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(logout());
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      dispatch(setLoading(true));
      const response = await api.get("/user/me");
      dispatch(setUser(response.data.user));
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout: logoutUser,
    checkAuth,
  };
};