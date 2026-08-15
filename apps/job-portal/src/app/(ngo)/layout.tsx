import { NgoNav, NgoFooter } from "@blackbox/module-ngo-site";

// Wraps the Blackbox Global Foundation pages ("/" and "/blackbox-index")
// with their own nav/footer — deliberately separate from the job-portal's
// (app) group and its <Nav />, since these aren't part of that product
// surface. Route groups don't add a URL segment, so pages here keep
// their normal paths.
export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NgoNav />
      {children}
      <NgoFooter />
    </>
  );
}
