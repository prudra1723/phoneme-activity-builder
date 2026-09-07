import type { Metadata } from "next";
import WordManager from "@/components/WordManager";

export const metadata: Metadata = {
  title: "Manage Words | Phoneme Activity Builder",
  description:
    "Create, view, update and delete phoneme-based words stored in the activity database.",
};

export default function ManagePage() {
  return (
    <main id="main-content" className="management-page">
      <section className="page-banner">
        <div className="page-container">
          <p className="eyebrow">Teacher database tools</p>
          <h1>Manage phoneme words</h1>
          <p>
            Create and maintain the database words used by Wordle and Word
            Search activities. Every change is validated by the backend API.
          </p>
        </div>
      </section>

      <section className="management-section">
        <div className="page-container">
          <WordManager />
        </div>
      </section>
    </main>
  );
}
