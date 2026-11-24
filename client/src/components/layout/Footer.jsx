import { Link } from "react-router-dom";
import BrandMark from "../common/BrandMark";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Flagger home">
          <BrandMark size="sm" />
          <span className="font-serif text-lg font-bold tracking-tight text-text-primary">
            Flagger
          </span>
        </Link>

        <p className="text-sm text-text-muted">
          &copy; {currentYear} Flagger. A quiet place for developers to write.
        </p>

        <a
          href="https://github.com/raoParam/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-text-secondary underline decoration-border-strong underline-offset-4 transition hover:text-text-primary hover:decoration-accent"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
