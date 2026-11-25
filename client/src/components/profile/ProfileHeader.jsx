import { ShieldCheck } from "lucide-react";

/**
 * Editorial profile header shared by the own-profile and public-profile pages.
 * stats: [{ key, label, count, onClick? }]  (onClick makes the stat a button)
 */
const ProfileHeader = ({ avatar, userName, fullName, verified, bio, joinedText, stats = [], action }) => {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      <div className="shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={userName}
            className="h-24 w-24 rounded-full border border-border object-cover sm:h-28 sm:w-28"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-border bg-surface-2 font-serif text-4xl font-semibold text-text-primary sm:h-28 sm:w-28">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words font-serif text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
              {fullName || `@${userName}`}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-text-secondary">
              @{userName}
              {verified && <ShieldCheck size={15} className="text-accent" aria-label="Verified writer" />}
            </p>
          </div>
          {action}
        </div>

        {bio && (
          <p className="mt-5 max-w-xl whitespace-pre-wrap break-words font-serif text-[17px] leading-relaxed text-text-body">
            {bio}
          </p>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          {stats.map((stat) => {
            const content = (
              <>
                <span className="font-semibold text-text-primary">{stat.count}</span>{" "}
                <span className="text-text-secondary">{stat.label}</span>
              </>
            );
            return (
              <li key={stat.key}>
                {stat.onClick ? (
                  <button
                    type="button"
                    onClick={stat.onClick}
                    className="rounded-md transition hover:underline hover:decoration-accent hover:decoration-2 hover:underline-offset-4"
                  >
                    {content}
                  </button>
                ) : (
                  <span>{content}</span>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-text-muted">Joined {joinedText || "Unknown"}</p>
      </div>
    </header>
  );
};

export default ProfileHeader;
