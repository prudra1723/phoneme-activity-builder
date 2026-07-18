"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const mobileNavigationItems = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/wordle", label: "Wordle", icon: "/θ/" },
  { href: "/word-search", label: "Word Search", icon: "⌕" },
  { href: "/about", label: "About", icon: "i" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        type="button"
        className={`mobile-menu-overlay ${isOpen ? "overlay-visible" : ""}`}
        aria-label="Close navigation menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <nav
        id="mobile-navigation"
        className={`mobile-menu ${isOpen ? "mobile-menu-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-header">
          <div>
            <p className="mobile-menu-eyebrow">Navigation</p>
            <p className="mobile-menu-title">Choose a page</p>
          </div>

          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <ul className="mobile-menu-list">
          {mobileNavigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`mobile-menu-link ${
                    isActive ? "mobile-menu-link-active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={onClose}
                >
                  <span className="mobile-menu-icon" aria-hidden="true">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>

                  <span className="mobile-menu-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mobile-menu-footer">
          <p>Speech Pathology Classroom Tools</p>
          <span>Assessment 1</span>
        </div>
      </nav>
    </>
  );
}
