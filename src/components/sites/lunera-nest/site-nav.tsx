import Link from "next/link";

export const ROUTES = {
  invitation: "/template-black-gold-graduation-rsvp",
  details: "/template-black-gold-graduation-rsvp/page-2",
} as const;

export type PageKey = keyof typeof ROUTES;

const LINKS: Array<{ key: PageKey; label: string }> = [
  { key: "invitation", label: "Page 1" },
  { key: "details", label: "Page 2" },
];

export function SiteNav({ active }: { active: PageKey }) {
  return (
    <nav className="ln-nav" aria-label="Pages">
      <ul>
        {LINKS.map(({ key, label }) => (
          <li key={key} data-active={key === active ? "" : undefined}>
            <Link href={ROUTES[key]} aria-current={key === active ? "page" : undefined}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
