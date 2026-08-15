import { BlackboxLogo } from "@blackbox/ui";
import { NewsletterForm } from "./sections/newsletter-form";

const FOOTER_NAV = [
  { href: "#about", label: "About" },
  { href: "#initiatives", label: "Our Flagship Initiatives" },
  { href: "#impact", label: "Impact" },
  { href: "#knowledge", label: "Knowledge & Resources" },
  { href: "#careers", label: "Careers" },
  { href: "#get-involved", label: "Get Involved" },
  { href: "#contact", label: "Contact" },
];

// Legal links are inert placeholders — no Privacy/Terms/Accessibility/
// Cookie pages exist yet (see docs/decisions.md scope note for this
// package). Left visible since the brief asks for them structurally, but
// they intentionally don't navigate anywhere yet.
const LEGAL_LINKS = ["Privacy Policy", "Terms", "Accessibility", "Cookie Policy"];

export function NgoFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1.4fr]">
          <div>
            <BlackboxLogo className="h-7 w-auto" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">Xclusively Inclusive.</p>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Blackbox Global Foundation is a non-profit organisation working to strengthen India&rsquo;s
              disability ecosystem.
            </p>
            <div className="mt-4 flex gap-3 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">LinkedIn</a>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
            {FOOTER_NAV.map((link) => (
              <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>

          <div>
            <p className="text-sm font-semibold text-foreground">Stay informed. Stay inclusive.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get research, opportunities, data and developments from India&rsquo;s disability ecosystem.
            </p>
            <div className="mt-3">
              <NewsletterForm compact />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Blackbox Global Foundation. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {LEGAL_LINKS.map((label) => (
              <a key={label} href="#" className="hover:text-foreground">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
