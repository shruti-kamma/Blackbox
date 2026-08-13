# Workspace Customization Rules

## Theme Configuration Rules

When the user asks to switch the website theme to **Light Theme** or **Dark Theme**, strictly apply the following exact color tokens:

### ☀️ Light Theme (`light`)
* **Background Color**: `#ffffff` (Pure White)
* **Primary / Brand Color**: `#03068d` (Navy Blue)
* **Foreground Text Color**: `#171717` / `#111111`
* **Card / Muted Background**: `#f4f4f5`
* **Border Color**: `#d4d4d8`
* **React Bits ShapeGrid Hexagons Border Color**: `#b9b8d7`

### 🌙 Dark Theme (`dark`)
* **Background Color**: `#000000` (Pure Black)
* **Primary / Brand Color**: `#7c3ca1` (Purple)
* **Foreground Text Color**: `#f4f4f5` / `#ffffff`
* **Card / Muted Background**: `#18181b`
* **Border Color**: `#27272a`
* **React Bits ShapeGrid Hexagons Border Color**: `#4c3b69`

---

### Implementation Instructions:
Whenever theme switching is requested, update:
1. `packages/config/tailwind/theme.css` (`--color-background`, `--color-foreground`, `--color-primary`, `--color-muted`, `--color-border`)
2. `apps/job-portal/src/app/globals.css` (`--color-primary`, `--color-secondary`, `--color-focus-ring`)
3. `apps/job-portal/src/app/ranking/ranking-theme.css` (`--color-primary`, `--color-card`, `--color-focus-ring`)
4. `apps/job-portal/src/app/page.tsx` (`ShapeGrid` `borderColor` property: `#b9b8d7` for Light, `#4c3b69` for Dark)
