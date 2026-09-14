import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Operations Dashboard",
  description:
    "Monitor stored activity data, generation results and application health.",
};

export default function DashboardPage() {
  return (
    <main id="main-content" className="dashboard-page">
      <section className="page-banner">
        <div className="page-container dashboard-banner-content">
          <div>
            <p className="eyebrow">Assessment 3 reporting</p>
            <h1>Operations Dashboard</h1>
            <p>
              Monitor database content, activity usage, generation results,
              warnings and application health.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="page-container">
          <Dashboard />
        </div>
      </section>
    </main>
  );
}
