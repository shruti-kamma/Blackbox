"use client";

import { useEffect, useState } from "react";
import ShapeGrid from "@/components/ui/ShapeGrid";

export function HeroShapeGrid() {
  const [borderColor, setBorderColor] = useState("#b9b8d7");

  useEffect(() => {
    const updateColor = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setBorderColor(currentTheme === "dark" ? "#4c3b69" : "#b9b8d7");
    };

    updateColor();

    const handleThemeChange = (e: Event) => {
      const customEv = e as CustomEvent<{ theme: "light" | "dark" }>;
      if (customEv.detail?.theme) {
        setBorderColor(customEv.detail.theme === "dark" ? "#4c3b69" : "#b9b8d7");
      } else {
        updateColor();
      }
    };

    window.addEventListener("blackbox-theme-change", handleThemeChange);
    return () => window.removeEventListener("blackbox-theme-change", handleThemeChange);
  }, []);

  return (
    <ShapeGrid
      speed={0.25}
      squareSize={45}
      direction="diagonal"
      borderColor={borderColor}
      hoverFillColor="transparent"
      shape="hexagon"
      hoverTrailAmount={0}
    />
  );
}
