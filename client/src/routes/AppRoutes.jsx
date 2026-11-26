import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";
import LoaderRing from "../components/common/LoaderRing";

// Pages are loaded on demand so the first visit downloads only what it needs
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const ExplorePage = lazy(() => import("../pages/public/ExplorePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const HomePage = lazy(() => import("../pages/feed/HomePage"));
const BlogPage = lazy(() => import("../pages/feed/BlogPage"));
const ProfilePage = lazy(() => import("../pages/user/ProfilePage"));
const UserProfilePage = lazy(() => import("../pages/user/UserProfilePage"));
const SettingsPage = lazy(() => import("../pages/user/SettingsPage"));
const WritePage = lazy(() => import("../pages/write/WritePage"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <LoaderRing size="lg" />
  </div>
);

const AppRoutes = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- check the session once on mount
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
};

export default AppRoutes;
