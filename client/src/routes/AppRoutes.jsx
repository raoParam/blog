import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import LandingPage from "../pages/public/LandingPage";
import ExplorePage from "../pages/public/ExplorePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/feed/HomePage";
import BlogPage from "../pages/feed/BlogPage";
import ProfilePage from "../pages/user/ProfilePage";
import UserProfilePage from "../pages/user/UserProfilePage";
import SettingsPage from "../pages/user/SettingsPage";
import WritePage from "../pages/write/WritePage";

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
      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      } />

      {/* Protected Routes - accessible only when logged in */}
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/blog/:postId" element={
        <ProtectedRoute>
          <BlogPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/write" element={
        <ProtectedRoute>
          <WritePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
