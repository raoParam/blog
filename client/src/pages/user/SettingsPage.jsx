import { Link, useNavigate } from "react-router-dom";
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

  const displayName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar user={user} onLogout={handleLogout} onWrite={() => navigate("/write")} />

      <main className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-text-secondary">Manage how Flagger looks and feels for you.</p>

        <section aria-labelledby="settings-appearance" className="mt-10 border-t border-border-subtle pt-8">
          <h2 id="settings-appearance" className="text-lg font-semibold text-text-primary">
            Appearance
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Choose a theme. System follows your device setting automatically.
          </p>
          <ThemeToggle className="mt-5" />
        </section>

        <section aria-labelledby="settings-account" className="mt-10 border-t border-border-subtle pt-8">
          <h2 id="settings-account" className="text-lg font-semibold text-text-primary">
            Account
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {displayName ? `${displayName} · ` : ""}
            {user?.userName ? `@${user.userName}` : "Signed in"}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-strong hover:bg-surface-1"
            >
              View profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:bg-surface-1 hover:text-text-primary"
            >
              Log out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
