"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import MobileMenu from "@/components/MobileMenu";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          <Link
            href="/"
            className="brand"
            aria-label="Phoneme Activity Builder home"
            onClick={closeMenu}
          >
            <span className="brand-icon" aria-hidden="true">
              /θ/
            </span>

            <span className="brand-text">
              <strong>Phoneme Activity Builder</strong>
              <small>Assessment 1</small>
            </span>
          </Link>

          <nav
            id="desktop-navigation"
            className="primary-navigation"
            aria-label="Primary navigation"
          >
            <ul>
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        isActive ? "navigation-link active" : "navigation-link"
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            className={`menu-button ${menuOpen ? "menu-button-open" : ""}`}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}
