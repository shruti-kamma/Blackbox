"use client";

import { useEffect, useState } from "react";
import ShapeGrid from "@/components/ui/ShapeGrid";

const LIGHT_GRID_COLOR = "rgba(3, 6, 141, 0.18)";
const DARK_GRID_COLOR = "rgba(167, 139, 250, 0.22)";

export function HeroShapeGrid() {
  const [borderColor, setBorderColor] = useState<string>(LIGHT_GRID_COLOR);

  useEffect(() => {
    const updateColor = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setBorderColor(currentTheme === "dark" ? DARK_GRID_COLOR : LIGHT_GRID_COLOR);
    };

    // Synchronize theme on initial mount
    updateColor();

    // Listen to custom theme change event
    const handleThemeChange = (e: Event) => {
      const customEv = e as CustomEvent<{ theme: "light" | "dark" }>;
      if (customEv.detail?.theme) {
        setBorderColor(customEv.detail.theme === "dark" ? DARK_GRID_COLOR : LIGHT_GRID_COLOR);
      } else {
        updateColor();
      }
    };

    window.addEventListener("blackbox-theme-change", handleThemeChange);

    // MutationObserver to watch data-theme attribute on <html> element
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          updateColor();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      window.removeEventListener("blackbox-theme-change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  return (
    <ShapeGrid
      speed={0}
      squareSize={45}
      direction="diagonal"
      borderColor={borderColor}
      hoverFillColor="transparent"
      shape="hexagon"
      hoverTrailAmount={0}
    />
  );
}
