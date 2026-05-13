import { useEffect, useState, FormEvent } from "react";

const PASSWORD = "GITHUBGulTesla65!";
const STORAGE_KEY = "em27_gate_ok";

const Index = () => {
  const [authed, setAuthed] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) window.location.replace("/site/index.html");
  }, [authed]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setValue("");
    }
  };

  if (authed) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#A1A1A6", fontFamily: "system-ui" }}>Laddar Energimässan 2027…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <form onSubmit={onSubmit} style={cardStyle}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6E6E73", fontWeight: 600 }}>
          Energimässan 2027
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "#F5F5F7", margin: 0 }}>
          Skyddad förhandsvisning
        </h1>
        <p style={{ color: "#A1A1A6", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          Ange lösenordet för att fortsätta.
        </p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="Lösenord"
          style={{
            ...inputStyle,
            borderColor: error ? "#FF375F" : "rgba(255,255,255,0.16)",
          }}
        />
        {error && (
          <div style={{ color: "#FF375F", fontSize: 13 }}>Fel lösenord, försök igen.</div>
        )}
        <button type="submit" style={btnStyle}>Logga in</button>
      </form>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#000",
  display: "grid",
  placeItems: "center",
  padding: 24,
  fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif',
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  display: "flex",
  flexDirection: "column",
  gap: 18,
  padding: 32,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  backdropFilter: "blur(20px)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#F5F5F7",
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
};

const btnStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: 100,
  background: "#F5F5F7",
  color: "#000",
  border: "none",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default Index;
