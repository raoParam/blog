/** rows: [{ label, value }] */
const ProfileAbout = ({ rows }) => {
  return (
    <dl className="divide-y divide-border-subtle">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 py-4 text-[15px]">
          <dt className="text-text-secondary">{row.label}</dt>
          <dd className="min-w-0 break-words text-text-body">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default ProfileAbout;
