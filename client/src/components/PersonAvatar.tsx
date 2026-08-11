import type { Person } from "../types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function PersonAvatar({
  person,
  size = 28,
}: {
  person: Pick<Person, "name" | "avatarColor"> | null | undefined;
  size?: number;
}) {
  if (!person) {
    return (
      <div
        className="rounded-full bg-gray-200 border border-dashed border-gray-400 flex items-center justify-center text-gray-400 shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title="Unassigned"
      >
        ?
      </div>
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, backgroundColor: person.avatarColor }}
      title={person.name}
    >
      {initials(person.name).toUpperCase()}
    </div>
  );
}
