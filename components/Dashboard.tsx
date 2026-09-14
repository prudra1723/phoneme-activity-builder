"use client";

import { useCallback, useEffect, useState } from "react";

type RecentEvent = {
  id: string;
  eventType: string;
  activityType: "WORDLE" | "WORD_SEARCH" | null;
  pagePath: string | null;
  durationMs: number | null;
  message: string | null;
  createdAt: string;
};

type DashboardAlert = {
  severity: "warning" | "error";
  message: string;
  items?: Array<{
    id: string;
    name: string;
  }>;
};

type DashboardData = {
  health: {
    status: string;
    database: string;
    generatedAt: string;
  };
  totals: {
    words: number;
    wordLists: number;
    activities: number;
    wordleActivities: number;
    wordSearchActivities: number;
    successfulGenerations: number;
    failedGenerations: number;
  };
  usage: {
    wordleGenerations: number;
    wordSearchGenerations: number;
    mostUsedActivityType: "WORDLE" | "WORD_SEARCH" | "TIE" | "NO_DATA";
    averageTimeOnPageMs: number;
  };
  alerts: DashboardAlert[];
  recentEvents: RecentEvent[];
};

function readableLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDuration(milliseconds: number) {
  if (milliseconds === 0) {
    return "No data";
  }

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  return `${(milliseconds / 1000).toFixed(1)} sec`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load dashboard");
      }

      setDashboard(result.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="dashboard-state" role="status">
        Loading dashboard information…
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="dashboard-state dashboard-error" role="alert">
        <h2>Dashboard unavailable</h2>
        <p>{error || "Dashboard data could not be loaded."}</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => void loadDashboard()}
        >
          Try again
        </button>
      </div>
    );
  }

  const totalGenerations =
    dashboard.usage.wordleGenerations + dashboard.usage.wordSearchGenerations;

  const wordlePercentage =
    totalGenerations === 0
      ? 0
      : Math.round(
          (dashboard.usage.wordleGenerations / totalGenerations) * 100,
        );

  const wordSearchPercentage =
    totalGenerations === 0 ? 0 : 100 - wordlePercentage;

  const metricCards = [
    {
      label: "Stored words",
      value: dashboard.totals.words,
      detail: "Database word records",
    },
    {
      label: "Word lists",
      value: dashboard.totals.wordLists,
      detail: "Saved teacher lists",
    },
    {
      label: "Wordle activities",
      value: dashboard.totals.wordleActivities,
      detail: "Stored Wordle configurations",
    },
    {
      label: "Word Search activities",
      value: dashboard.totals.wordSearchActivities,
      detail: "Stored Word Search configurations",
    },
    {
      label: "Successful generations",
      value: dashboard.totals.successfulGenerations,
      detail: "Downloaded activities",
    },
    {
      label: "Failed generations",
      value: dashboard.totals.failedGenerations,
      detail: "Generation errors recorded",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-toolbar">
        <div>
          <p className="eyebrow">Live system status</p>
          <h2>Application overview</h2>
          <p>Updated {formatDate(dashboard.health.generatedAt)}</p>
        </div>

        <div className="dashboard-toolbar-actions">
          <span
            className={`health-badge ${
              dashboard.health.status === "ok" ? "healthy" : "unhealthy"
            }`}
          >
            <span aria-hidden="true" />
            Database {dashboard.health.database}
          </span>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => void loadDashboard()}
          >
            Refresh data
          </button>
        </div>
      </div>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="dashboard-section-title">
          Stored data and generation summary
        </h2>

        <div className="metric-grid">
          {metricCards.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-report-grid">
        <section className="report-card" aria-labelledby="usage-heading">
          <div className="report-card-heading">
            <div>
              <p className="eyebrow">Usage report</p>
              <h2 id="usage-heading">Generated activity types</h2>
            </div>

            <span className="report-highlight">
              Most used: {readableLabel(dashboard.usage.mostUsedActivityType)}
            </span>
          </div>

          <div className="usage-chart">
            <div className="usage-chart-row">
              <div>
                <strong>Wordle</strong>
                <span>{dashboard.usage.wordleGenerations} generations</span>
              </div>

              <div
                className="usage-track"
                role="progressbar"
                aria-label="Wordle generation percentage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={wordlePercentage}
              >
                <span style={{ width: `${wordlePercentage}%` }} />
              </div>

              <strong>{wordlePercentage}%</strong>
            </div>

            <div className="usage-chart-row word-search">
              <div>
                <strong>Word Search</strong>
                <span>{dashboard.usage.wordSearchGenerations} generations</span>
              </div>

              <div
                className="usage-track"
                role="progressbar"
                aria-label="Word Search generation percentage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={wordSearchPercentage}
              >
                <span style={{ width: `${wordSearchPercentage}%` }} />
              </div>

              <strong>{wordSearchPercentage}%</strong>
            </div>
          </div>

          <dl className="dashboard-details">
            <div>
              <dt>Total activities</dt>
              <dd>{dashboard.totals.activities}</dd>
            </div>

            <div>
              <dt>Average time on page</dt>
              <dd>{formatDuration(dashboard.usage.averageTimeOnPageMs)}</dd>
            </div>
          </dl>
        </section>

        <section className="report-card" aria-labelledby="alerts-heading">
          <div className="report-card-heading">
            <div>
              <p className="eyebrow">Operational monitoring</p>
              <h2 id="alerts-heading">Alerts and warnings</h2>
            </div>

            <span className="alert-count">{dashboard.alerts.length}</span>
          </div>

          {dashboard.alerts.length === 0 ? (
            <div className="empty-report">
              <strong>No current alerts</strong>
              <p>The application has not detected unusual conditions.</p>
            </div>
          ) : (
            <ul className="dashboard-alerts">
              {dashboard.alerts.map((alert, index) => (
                <li
                  className={`dashboard-alert ${alert.severity}`}
                  key={`${alert.message}-${index}`}
                >
                  <strong>{readableLabel(alert.severity)}</strong>
                  <p>{alert.message}</p>

                  {alert.items && (
                    <small>
                      {alert.items.map((item) => item.name).join(", ")}
                    </small>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="report-card" aria-labelledby="events-heading">
        <div className="report-card-heading">
          <div>
            <p className="eyebrow">Observability log</p>
            <h2 id="events-heading">Recent events</h2>
          </div>
        </div>

        {dashboard.recentEvents.length === 0 ? (
          <div className="empty-report">
            <strong>No events recorded</strong>
            <p>Usage events will appear after teachers use the builders.</p>
          </div>
        ) : (
          <div className="event-table-wrapper">
            <table className="event-table">
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Activity</th>
                  <th scope="col">Page</th>
                  <th scope="col">Details</th>
                  <th scope="col">Recorded</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span
                        className={`event-badge ${event.eventType.toLowerCase()}`}
                      >
                        {readableLabel(event.eventType)}
                      </span>
                    </td>
                    <td>
                      {event.activityType
                        ? readableLabel(event.activityType)
                        : "General"}
                    </td>
                    <td>{event.pagePath || "—"}</td>
                    <td>
                      {event.message ||
                        (event.durationMs !== null
                          ? formatDuration(event.durationMs)
                          : "—")}
                    </td>
                    <td>{formatDate(event.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
