import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LoginCTA = () => {
  return (
    <section className="mt-16 border-y border-border-subtle bg-surface-1">
      <div className="px-6 py-14 text-center sm:px-10">
        <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
          Want to read the rest?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
          Sign in to open every post, follow writers and join the conversation.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-fg transition hover:bg-accent-hover sm:w-auto"
          >
            Sign in to keep reading
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center rounded-lg border border-border-strong px-6 py-3 text-base font-medium text-text-primary transition hover:bg-surface-2 sm:w-auto"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoginCTA;
