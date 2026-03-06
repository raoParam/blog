import { useSelector, useDispatch } from "react-redux";
import {
  loginSuccess,
  setUser,
  setLoading,
  setError,
  logoutUser,
} from "../store/slices/authSlice";
import { authService } from "../services/auth.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      dispatch(setError(null));
      const data = await authService.login({
        emailId: email,
        password,
      });

      const { accessToken, refreshToken, user } = data;

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
        data
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
        await authService.logout({ refreshToken });
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
    dispatch(setLoading(true));
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    try {
      const data = await authService.getCurrentUser();
      dispatch(setUser(data?.user || null));
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
