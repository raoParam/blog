import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import LandingPage from "../pages/public/LandingPage";
import ExplorePage from "../pages/public/ExplorePage";
// import LoginPage from "../pages/auth/LoginPage";
// import RegisterPage from "../pages/auth/RegisterPage";
// import HomePage from "../pages/feed/HomePage";

const AppRoutes = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public Only Routes - accessible only when NOT logged in */}
      <Route path="/" element={
        <PublicOnlyRoute>
          <LandingPage />
        </PublicOnlyRoute>
      } />
      <Route path="/explore" element={
        <PublicOnlyRoute>
          <ExplorePage />
        </PublicOnlyRoute>
      } />
      {/*<Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      } />*/}

      {/* Protected Routes - accessible only when logged in */}
     {/* <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />*/}
    </Routes>
  );
};

export default AppRoutes;