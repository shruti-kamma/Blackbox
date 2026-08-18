import { NgoNav, NgoFooter } from "@blackbox/module-ngo-site";

// The full Blackbox Global Foundation site, with its own nav/footer —
// deliberately separate from the job-portal's (app) group and its <Nav />.
// The bare "/" is now the pre-launch countdown teaser (see app/page.tsx);
// this is where the real site lives once you're past it.
export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NgoNav />
      {children}
      <NgoFooter />
    </>
  );
}
