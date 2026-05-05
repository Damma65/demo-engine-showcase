import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
      <p>Laddar Energimässan 2027…</p>
    </div>
  );
};

export default Index;
