import { useState } from "react";
import Home from "./screens/Home";
import Brew from "./screens/Brew";
import Complete from "./screens/Complete";

type Screen = "home" | "brew" | "complete";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "brew") return <Brew onNavigate={setScreen} />;
  if (screen === "complete") return <Complete onNavigate={setScreen} />;
  return <Home onNavigate={setScreen} />;
}
