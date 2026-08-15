import { Nav } from "@/components/nav";
import { PortalSelectProvider } from "@/components/a11y/portal-select-provider";

// Everything that isn't the NGO landing page ("/") lives under this
// route group — /index, /index/rankings, /nexo/**. Route groups don't
// affect the URL, so pages here keep their normal paths.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalSelectProvider>
      <Nav />
      {children}
    </PortalSelectProvider>
  );
}
