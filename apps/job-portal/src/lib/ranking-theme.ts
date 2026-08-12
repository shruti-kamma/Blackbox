// Shared between app/ranking/layout.tsx (sets the id this targets),
// components/ranking/theme-toggle.tsx (reads/writes the same key), and the
// root layout (runs the init script — see app/layout.tsx for why it has to
// live there instead of the ranking layout itself).
export const RANKING_ROOT_ID = "ranking-root";
export const RANKING_THEME_STORAGE_KEY = "blackbox-rankings-theme";

// Sets #ranking-root's data-theme before paint, so the /ranking section
// never flashes the wrong theme. A no-op on every other route, since
// #ranking-root only exists under /ranking — safe to run from the root
// layout via next/script's beforeInteractive strategy, which Next.js only
// allows to be declared there (a nested layout's <Script
// strategy="beforeInteractive"> silently fails to hoist, and a plain inline
// <script> tag triggers React 19's "never rendered on the client" warning
// during hydration) — so this can't live in app/ranking/layout.tsx itself.
export const RANKING_THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("${RANKING_THEME_STORAGE_KEY}");
      var theme =
        stored === "light" || stored === "dark"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      var root = document.getElementById("${RANKING_ROOT_ID}");
      if (root) root.dataset.theme = theme;
    } catch (e) {}
  })();
`;
