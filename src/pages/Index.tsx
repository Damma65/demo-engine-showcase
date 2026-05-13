import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.replace("/site/index.html");
  }, []);
  return null;
};

export default Index;
