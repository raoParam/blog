import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import HomeNavbar from "../../components/feed/HomeNavbar";
import ThemeToggle from "../../components/common/ThemeToggle";

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar user={user} onLogout={handleLogout} onWrite={() => navigate("/write")} />

      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-2 text-text-secondary">Manage how Flagger looks and feels for you.</p>

        <section className="mt-10 rounded-2xl border border-border bg-surface-1 p-6">
          <h2 className="text-lg font-semibold text-text-primary">Appearance</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Choose a theme. System follows your device setting automatically.
          </p>
          <ThemeToggle className="mt-5" />
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
