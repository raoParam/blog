import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  setUser,
  setLoading,
  setError,
  logoutUser,
} from "../store/slices/authSlice";
import api from "../services/axiosInstance";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      dispatch(setError(null));
      const response = await api.post("/auth/login", { 
        emailId: email, 
        password 
      });
      
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      dispatch(
        loginSuccess({
          user,
          accessToken,
        })
      );
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (err) {
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message || "Invalid email or password";
      dispatch(setError(errorMessage));
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Continue logout cleanup even if server logout fails
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(logoutUser());
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      dispatch(setLoading(true));
      const response = await api.get("/user/me");
      dispatch(setUser(response.data?.user || null));
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(logoutUser());
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
    logout,
    checkAuth,
  };
};
