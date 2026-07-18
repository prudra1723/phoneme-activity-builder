"use client";

import { useEffect, useState } from "react";

import { type Theme, useTheme } from "@/components/ThemeProvider";

type LayoutDensity = "comfortable" | "compact";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie?.split("=")[1] ?? null;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [layoutDensity, setLayoutDensityState] =
    useState<LayoutDensity>("comfortable");
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedDensity = readCookie("phoneme-layout");

      if (savedDensity === "compact" || savedDensity === "comfortable") {
        setLayoutDensityState(savedDensity);
      }

      setPreferencesLoaded(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    document.documentElement.dataset.density = layoutDensity;

    document.cookie =
      `phoneme-layout=${layoutDensity}; path=/; ` +
      "max-age=31536000; SameSite=Lax";
  }, [layoutDensity, preferencesLoaded]);

  const selectTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    showSavedMessage("Theme preference saved.");
  };

  const selectLayoutDensity = (selectedDensity: LayoutDensity) => {
    setLayoutDensityState(selectedDensity);
    showSavedMessage("Layout preference saved.");
  };

  const showSavedMessage = (message: string) => {
    setSavedMessage(message);

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const resetSettings = () => {
    setTheme("light");
    setLayoutDensityState("comfortable");
    showSavedMessage("Settings restored to defaults.");
  };

  return (
    <main id="main-content" className="settings-page">
      <section className="page-banner">
        <div className="page-container">
          <p className="eyebrow">Personalise your workspace</p>
          <h1>Settings</h1>
          <p>
            Choose a comfortable visual theme and layout for building classroom
            activities. Your preferences are saved in browser cookies.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="page-container settings-layout">
          <div className="settings-main">
            <section
              className="settings-card"
              aria-labelledby="theme-settings-heading"
            >
              <div className="settings-card-heading">
                <span className="settings-heading-icon" aria-hidden="true">
                  ◐
                </span>

                <div>
                  <h2 id="theme-settings-heading">Colour theme</h2>
                  <p>
                    Select the appearance that is clearest and most comfortable
                    for you.
                  </p>
                </div>
              </div>

              <fieldset className="settings-options">
                <legend className="visually-hidden">Select colour theme</legend>

                <label
                  className={`settings-option ${
                    theme === "light" ? "settings-option-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => selectTheme("light")}
                  />

                  <span className="theme-preview theme-preview-light">
                    <span className="theme-preview-header" />
                    <span className="theme-preview-content">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>

                  <span className="settings-option-content">
                    <strong>Light</strong>
                    <small>Bright background with dark text</small>
                  </span>

                  <span className="settings-check" aria-hidden="true">
                    ✓
                  </span>
                </label>

                <label
                  className={`settings-option ${
                    theme === "dark" ? "settings-option-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => selectTheme("dark")}
                  />

                  <span className="theme-preview theme-preview-dark">
                    <span className="theme-preview-header" />
                    <span className="theme-preview-content">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>

                  <span className="settings-option-content">
                    <strong>Dark</strong>
                    <small>Dark background with light text</small>
                  </span>

                  <span className="settings-check" aria-hidden="true">
                    ✓
                  </span>
                </label>
              </fieldset>
            </section>

            <section
              className="settings-card"
              aria-labelledby="layout-settings-heading"
            >
              <div className="settings-card-heading">
                <span className="settings-heading-icon" aria-hidden="true">
                  ↔
                </span>

                <div>
                  <h2 id="layout-settings-heading">Layout spacing</h2>
                  <p>
                    Adjust the amount of space used between interface controls.
                  </p>
                </div>
              </div>

              <fieldset className="density-options">
                <legend className="visually-hidden">
                  Select layout spacing
                </legend>

                <label
                  className={`density-option ${
                    layoutDensity === "comfortable"
                      ? "density-option-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="layout-density"
                    value="comfortable"
                    checked={layoutDensity === "comfortable"}
                    onChange={() => selectLayoutDensity("comfortable")}
                  />

                  <span>
                    <strong>Comfortable</strong>
                    <small>
                      More spacing and larger controls for easier interaction
                    </small>
                  </span>
                </label>

                <label
                  className={`density-option ${
                    layoutDensity === "compact" ? "density-option-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="layout-density"
                    value="compact"
                    checked={layoutDensity === "compact"}
                    onChange={() => selectLayoutDensity("compact")}
                  />

                  <span>
                    <strong>Compact</strong>
                    <small>
                      Reduced spacing to display more content on the screen
                    </small>
                  </span>
                </label>
              </fieldset>
            </section>

            <section
              className="settings-card accessibility-card"
              aria-labelledby="accessibility-heading"
            >
              <div className="settings-card-heading">
                <span className="settings-heading-icon" aria-hidden="true">
                  A
                </span>

                <div>
                  <h2 id="accessibility-heading">Accessibility support</h2>
                  <p>
                    Accessibility features are enabled throughout the
                    application.
                  </p>
                </div>
              </div>

              <ul className="accessibility-list">
                <li>
                  <span aria-hidden="true">✓</span>
                  Keyboard-accessible controls
                </li>
                <li>
                  <span aria-hidden="true">✓</span>
                  Visible focus indicators
                </li>
                <li>
                  <span aria-hidden="true">✓</span>
                  High-contrast light and dark themes
                </li>
                <li>
                  <span aria-hidden="true">✓</span>
                  Reduced-motion preference support
                </li>
              </ul>
            </section>

            <div className="settings-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={resetSettings}
              >
                Restore default settings
              </button>

              <p className="settings-status" role="status" aria-live="polite">
                {savedMessage}
              </p>
            </div>
          </div>

          <aside className="settings-summary" aria-labelledby="summary-heading">
            <p className="settings-summary-label">Current preferences</p>
            <h2 id="summary-heading">Your workspace</h2>

            <dl>
              <div>
                <dt>Theme</dt>
                <dd>{theme === "light" ? "Light" : "Dark"}</dd>
              </div>

              <div>
                <dt>Layout</dt>
                <dd>
                  {layoutDensity === "comfortable" ? "Comfortable" : "Compact"}
                </dd>
              </div>

              <div>
                <dt>Storage</dt>
                <dd>Browser cookies</dd>
              </div>
            </dl>

            <p className="settings-summary-note">
              Settings apply to this browser and remain available when you
              return to the activity builder.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
