import React, { useState, useEffect } from "react";
import { holidaysApi } from "../../api";
import toast from "react-hot-toast";

const TYPE_BADGE = {
  National:  { cls: "badge-indigo", icon: "🇮🇳" },
  Festival:  { cls: "badge-purple", icon: "🪔" },
  Regional:  { cls: "badge-orange", icon: "🗺️" },
  Company:   { cls: "badge-green",  icon: "🏢" },
  Other:     { cls: "badge-gray",   icon: "📌" },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function EssHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    holidaysApi
      .list({ year })
      .then((data) => setHolidays(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load holidays"))
      .finally(() => setLoading(false));
  }, [year]);

  // Group holidays by calendar month
  const byMonth = holidays.reduce((acc, h) => {
    const d = new Date(h.holiday_date ?? h.start_date ?? h.date);
    if (isNaN(d)) return acc;
    const m = d.getMonth();
    if (!acc[m]) acc[m] = [];
    acc[m].push({ ...h, _date: d });
    return acc;
  }, {});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalHolidays = holidays.length;
  const upcoming = holidays.filter((h) => {
    const d = new Date(h.holiday_date ?? h.start_date ?? h.date);
    return d >= today;
  }).length;

  return (
    <div className="animate-fade" style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>🎉 Holidays {year}</h1>
        <p style={{ color: "var(--clr-text-muted)", margin: "0.25rem 0 0" }}>
          Official holiday calendar for the current year
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Total Holidays" value={totalHolidays} icon="📅" color="var(--clr-primary)" />
        <StatCard label="Upcoming" value={upcoming} icon="⏳" color="var(--clr-success)" />
        <StatCard
          label="Already Passed"
          value={totalHolidays - upcoming}
          icon="✅"
          color="var(--clr-text-muted)"
        />
      </div>

      {/* Monthly sections */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--clr-text-muted)" }}>
          Loading holidays…
        </div>
      ) : Object.keys(byMonth).length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {MONTH_NAMES.map((monthName, idx) => {
            if (!byMonth[idx]) return null;
            const monthHols = byMonth[idx].sort((a, b) => a._date - b._date);
            return (
              <MonthSection
                key={idx}
                monthName={monthName}
                holidays={monthHols}
                today={today}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "1.75rem",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          background: "rgba(99,102,241,0.1)",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginTop: "0.25rem" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function MonthSection({ monthName, holidays, today }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3
        style={{
          margin: "0 0 1rem",
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--clr-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          borderBottom: "1px solid var(--clr-border)",
          paddingBottom: "0.75rem",
        }}
      >
        {monthName}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {holidays.map((h, i) => {
          const isPast = h._date < today;
          const isToday = h._date.toDateString() === today.toDateString();
          const type = h.holiday_type ?? h.type ?? "Other";
          const badge = TYPE_BADGE[type] ?? TYPE_BADGE["Other"];
          const name = h.holiday_name ?? h.name ?? "Holiday";
          const dateStr = h._date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const isOptional = h.is_optional;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: isToday
                  ? "rgba(99,102,241,0.12)"
                  : isPast
                  ? "transparent"
                  : "rgba(255,255,255,0.03)",
                border: isToday
                  ? "1px solid var(--clr-primary)"
                  : "1px solid var(--clr-border)",
                opacity: isPast ? 0.55 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {/* Date badge */}
              <div
                style={{
                  minWidth: "52px",
                  textAlign: "center",
                  background: isToday ? "var(--clr-primary)" : "var(--clr-surface-2)",
                  borderRadius: "8px",
                  padding: "0.4rem 0.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: isToday ? "#fff" : "var(--clr-text)",
                  }}
                >
                  {h._date.getDate()}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: isToday ? "rgba(255,255,255,0.8)" : "var(--clr-text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {h._date.toLocaleDateString("en-IN", { weekday: "short" })}
                </div>
              </div>

              {/* Name + type */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {badge.icon} {name}
                  {isToday && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "var(--clr-primary)",
                        color: "#fff",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontWeight: 600,
                      }}
                    >
                      TODAY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginTop: "0.15rem" }}>
                  {dateStr}
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span className={`badge ${badge.cls}`}>{type}</span>
                {isOptional && (
                  <span className="badge badge-orange" title="Optional — employees may choose to avail">
                    Optional
                  </span>
                )}
                {isPast && (
                  <span className="badge badge-gray">Past</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "5rem 2rem",
        color: "var(--clr-text-muted)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗓️</div>
      <h3 style={{ margin: "0 0 0.5rem" }}>No holidays configured</h3>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>
        Contact HR to have the holiday calendar set up.
      </p>
    </div>
  );
}
