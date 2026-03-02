from pathlib import Path
path = Path('client/src/pages/user/ProfilePage.jsx')
text = path.read_text()
start_marker = '        <section className="rounded-3xl border border-[#10131B] bg-[#020307] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.6)] sm:p-6">'
start = text.index(start_marker)
end = text.index('        </section>', start) + len('        </section>')
replacement = """
        <section className="relative rounded-3xl border border-[#10131B] bg-[#020307] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.6)] sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={userName}
                    className="h-24 w-24 rounded-full border-2 border-[#1F2130] object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#1F2130] bg-[#0B0E17] text-2xl font-semibold text-[#F8FBFF]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-wrap gap-4">
                {stats.map((stat) =>
                  stat.key == "posts" ? (
                    <div
                      key={stat.key}
                      className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left"
                    >
                      <span className="text-xs text-[#6E7489]">{stat.label}</span>
                      <span className="text-lg font-semibold text-[#F8FBFF]">{stat.count}</span>
                    </div>
                  ) : (
                    <button
                      key={stat.key}
                      type="button"
                      onClick={() => openConnectionsList(stat.key)}
                      className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left transition hover:border hover:border-[#7FA8CA]"
                    >
                      <span className="text-xs text-[#6E7489]">{stat.label}</span>
                      <span className="text-lg font-semibold text-[#F8FBFF]">{stat.count}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-[#8C95A7]">@{userName}</p>
              <p className="text-base font-semibold text-[#F3F7FF]">
                {profile?.firstName || profile?.lastName ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() : ""}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs font-semibold text-[#8C95A7]">
              Joined {joinedText || "Unknown"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              initializeEditForm(profile || {});
              setEditOpen(true);
            }}
            aria-label="Edit profile"
            className="absolute right-4 bottom-4 rounded-full border border-[#1F2130] bg-[#0B0E17] p-3 text-[#EAF1FF] transition hover:border-[#7FA8CA]"
          >
            <Edit3 size={18} />
          </button>
        </section>
"""
path.write_text(text[:start] + replacement + text[end:])
