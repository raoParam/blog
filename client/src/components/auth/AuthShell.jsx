import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandMark from "../common/BrandMark";

/** Shared input styling for auth forms. */
export const authInputClass =
  "w-full rounded-lg border border-border bg-surface-1 px-3.5 py-3 text-[15px] text-text-primary outline-none transition placeholder:text-text-muted hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/25";

export const authLabelClass = "mb-1.5 block text-sm font-medium text-text-body";

export const authButtonClass =
  "inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-accent-fg transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

const highlights = [
  "A Markdown editor built for developers",
  "Post anonymously whenever you want",
  "Earn a verified writer badge",
];

/**
 * Split layout for sign in / sign up.
 * Left: brand panel (desktop only, always dark). Right: the form.
 */
const AuthShell = ({ title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <aside
        className="relative hidden overflow-hidden bg-neutral-950 bg-cover bg-center lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ backgroundImage: "url('/login_bg.webp')" }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/55"
          aria-hidden="true"
        />

        <Link to="/" className="relative z-10 inline-flex items-center gap-3" aria-label="Flagger home">
          <BrandMark />
          <span className="font-serif text-2xl font-bold tracking-tight text-white">Flagger</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-serif text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
            Write freely.
            <br />
            <span className="font-normal italic text-white/90">Grow together.</span>
          </h2>

          <ul className="mt-8 space-y-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-white/90">
                <span className="mt-2 h-px w-4 shrink-0 bg-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen min-w-0 flex-col px-6 py-8 sm:px-10 lg:min-h-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 lg:hidden" aria-label="Flagger home">
            <BrandMark size="sm" />
            <span className="font-serif text-xl font-bold tracking-tight text-text-primary">Flagger</span>
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary sm:text-[2rem]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{subtitle}</p>}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-8 text-center text-sm text-text-body">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
