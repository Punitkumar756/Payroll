/**
 * Placeholder for pages planned in later phases.
 * Shows a styled "coming soon" card so navigation works without crashing.
 */
export default function LazyPage({ title }) {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{title}</h1>
          <p>This page is ready to be implemented</p>
        </div>
      </div>
      <div className="card">
        <div
          className="card-body"
          style={{ textAlign: "center", padding: "var(--sp-2xl)" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "var(--sp-md)" }}>
            🚧
          </div>
          <h3 style={{ marginBottom: "var(--sp-sm)" }}>{title}</h3>
          <p className="text-muted">
            This page's backend API and stored procedures are fully implemented.
            <br />
            The UI component will be built in the next phase.
          </p>
          <div
            style={{
              marginTop: "var(--sp-lg)",
              padding: "var(--sp-md)",
              background: "rgba(99,102,241,0.1)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--clr-border-active)",
              display: "inline-block",
            }}
          >
            <span
              style={{
                color: "var(--clr-primary-light)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              ✅ Backend SP ready · ✅ API routes ready · ⏳ UI coming in Phase
              1+
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
