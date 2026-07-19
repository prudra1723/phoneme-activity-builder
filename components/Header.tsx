"use client";

import Link from "next/link";
import { useState } from "react";

import MobileMenu from "@/components/MobileMenu";
import Navigation from "@/components/Navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((currentState) => !currentState);
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
            </span>
          </Link>

          <Navigation onNavigate={closeMenu} />

          <button
            type="button"
            className={`menu-button ${menuOpen ? "menu-button-open" : ""}`}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={toggleMenu}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}
