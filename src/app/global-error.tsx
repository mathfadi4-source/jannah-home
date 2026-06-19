"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf6f0" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e8d5b8",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "28rem",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</p>
            <h1 style={{ color: "#7a4b1a", marginBottom: "0.5rem" }}>Erreur serveur</h1>
            <p style={{ color: "#8a6f57", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {error.message || "Une erreur inattendue s'est produite."}
            </p>
            <button
              onClick={reset}
              style={{
                background: "#c07b3a",
                color: "white",
                border: "none",
                borderRadius: "0.625rem",
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
