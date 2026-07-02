"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Bir şeyler ters gitti</h2>
          <p style={{ color: "#71717a", fontSize: 14 }}>Lütfen tekrar dene.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  )
}
