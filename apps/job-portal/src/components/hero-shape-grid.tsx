"use client";

import { useEffect, useState } from "react";
import Particles from "@/components/ui/Particles";

const LIGHT_PARTICLE_COLORS = ["#03068d", "#2563eb", "#3b82f6"];
const DARK_PARTICLE_COLORS = ["#a78bfa", "#c4b5fd", "#8b5cf6"];

export function HeroShapeGrid() {
  const [particleColors, setParticleColors] = useState<string[]>(LIGHT_PARTICLE_COLORS);

  useEffect(() => {
    const updateColors = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setParticleColors(currentTheme === "dark" ? DARK_PARTICLE_COLORS : LIGHT_PARTICLE_COLORS);
    };

    updateColors();

    const handleThemeChange = (e: Event) => {
      const customEv = e as CustomEvent<{ theme: "light" | "dark" }>;
      if (customEv.detail?.theme) {
        setParticleColors(customEv.detail.theme === "dark" ? DARK_PARTICLE_COLORS : LIGHT_PARTICLE_COLORS);
      } else {
        updateColors();
      }
    };

    window.addEventListener("blackbox-theme-change", handleThemeChange);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          updateColors();
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
    <Particles
      particleCount={250}
      particleSpread={12}
      speed={0.15}
      particleColors={particleColors}
      moveParticlesOnHover={false}
      particleHoverFactor={0}
      alphaParticles={true}
      particleBaseSize={80}
      sizeRandomness={0.8}
      cameraDistance={20}
      disableRotation={false}
    />
  );
}
