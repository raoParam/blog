import { Link } from "react-router-dom";
import BrandMark from "../common/BrandMark";

const NavbarLoggedOut = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8"
      >
        <Link to="/" className="flex items-center gap-2.5" aria-label="Flagger home">
          <BrandMark size="sm" />
          <span className="font-serif text-xl font-bold tracking-tight text-text-primary">
            Flagger
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/explore"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:text-text-primary sm:block"
          >
            Explore
          </Link>
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="ml-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default NavbarLoggedOut;
