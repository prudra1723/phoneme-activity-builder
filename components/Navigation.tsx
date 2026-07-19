"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigationItems = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/wordle",
    label: "Wordle",
  },
  {
    href: "/word-search",
    label: "Word Search",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

type NavigationProps = {
  id?: string;
  ariaLabel?: string;
  onNavigate?: () => void;
};

export default function Navigation({
  id = "desktop-navigation",
  ariaLabel = "Primary navigation",
  onNavigate,
}: NavigationProps) {
  const pathname = usePathname();

  const isCurrentPage = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <nav id={id} className="primary-navigation" aria-label={ariaLabel}>
      <ul>
        {navigationItems.map((item) => {
          const active = isCurrentPage(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  active ? "navigation-link active" : "navigation-link"
                }
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
