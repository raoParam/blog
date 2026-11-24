const features = [
  {
    title: "A proper Markdown editor",
    description:
      "Write with full formatting support: code blocks, headings, lists and syntax highlighting, with a live preview as you type.",
  },
  {
    title: "Anonymous posting",
    description:
      "Share freely without revealing your identity. Speak honestly, think openly.",
  },
  {
    title: "Verified writer badge",
    description:
      "Earn recognition for quality contributions and build credibility with readers.",
  },
  {
    title: "Developer communities",
    description:
      "Join public and private groups built around real developer interests.",
  },
  {
    title: "Learning in public",
    description:
      "Document your journey, showcase your skills and build a body of work people can find.",
  },
  {
    title: "Discovery that stays quiet",
    description:
      "Explore trending ideas, follow writers and shape a feed that fits how you read.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="border-t border-border-subtle">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Features
            </p>
            <h2 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl">
              Built for developers who think in public.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-text-secondary">
              Everything you need to write, publish and talk about ideas, and
              nothing that gets in the way of the words.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-7">
          {features.map((feature, index) => (
            <li key={feature.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-7 sm:grid-cols-[3.5rem_1fr]">
              <span className="pt-1 font-mono text-sm text-text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default FeaturesSection;
