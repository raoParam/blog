import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="border-y border-border-subtle bg-surface-1">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-10 px-6 py-20 sm:px-8 sm:py-28 md:grid-cols-12">
        <div className="md:col-span-8">
          <h2 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Have something worth writing down?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Write in Markdown, publish when it is ready, and stay anonymous if
            you want to.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col md:items-stretch lg:ml-auto lg:w-64">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-accent-fg transition hover:bg-accent-hover"
          >
            Create an account
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center rounded-lg border border-border-strong px-6 py-3.5 text-base font-medium text-text-primary transition hover:bg-surface-2"
          >
            Browse the feed
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
