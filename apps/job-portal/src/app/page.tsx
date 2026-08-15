import Link from "next/link";
import { BlackboxLogo } from "@blackbox/ui";
import { CountdownTimer } from "@/components/coming-soon/countdown-timer";
import { NotifyForm } from "@/components/coming-soon/notify-form";

// Pre-launch teaser at the bare "/" — the real Blackbox Global Foundation
// site now lives at /ngo (see app/ngo/page.tsx). Deliberately its own
// minimal header/footer rather than NgoNav/NgoFooter (packages/module-
// ngo-site): a one-page countdown has no site nav to speak of.
export default function Home() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <BlackboxLogo className="h-7 w-auto" />
            <span className="hidden border-l border-border pl-3 text-xs font-medium tracking-wide text-muted-foreground sm:inline">
              Xclusively Inclusive.
            </span>
          </Link>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section className="border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30 px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              From intent to action.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              India has made important commitments towards inclusion.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Yet a significant gap remains between what the system intends to achieve and what persons with
              disabilities experience in reality.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              We are building something to help close that gap.
            </p>
            <p className="mt-8 text-lg font-semibold text-primary">What gets measured, gets improved.</p>
          </div>
        </section>

        {/* 2. The Reveal */}
        <section className="border-b border-border px-4 py-24 text-center sm:px-6 sm:py-32">
          <p className="text-2xl font-bold text-foreground sm:text-3xl">Something is coming.</p>

          <ul className="mx-auto mt-10 flex max-w-xl flex-col gap-3 text-xl font-bold tracking-wide text-foreground sm:text-2xl">
            <li>DATA.</li>
            <li>OPPORTUNITY.</li>
            <li>TECHNOLOGY.</li>
            <li>PARTNERSHIPS.</li>
          </ul>

          <p className="mt-8 text-lg font-semibold text-primary">One ecosystem.</p>

          <div className="mt-20 sm:mt-28">
            <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              THE BOX OPENS
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-primary sm:text-base">
              03 December 2026
            </p>
            <div className="mt-10">
              <CountdownTimer />
            </div>
          </div>
        </section>

        {/* 3. Independence Day context */}
        <section className="border-b border-border bg-muted px-4 py-16 text-center sm:px-6">
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            On India&rsquo;s 80th Independence Day, we begin a journey towards a more inclusive Viksit Bharat by
            2047.
          </p>
        </section>

        {/* 4. The Mystery */}
        <section className="border-b border-border px-4 py-24 text-center sm:px-6">
          <div className="mx-auto max-w-2xl">
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We aren&rsquo;t ready to show you everything yet.
            </p>
            <p className="mt-4 text-lg font-semibold text-foreground sm:text-xl">
              But we are ready to tell you this:
            </p>
            <p className="mt-8 text-xl font-bold text-foreground sm:text-2xl">Something is being built.</p>
            <ul className="mt-6 flex flex-col gap-2 text-base text-muted-foreground sm:text-lg">
              <li>Something that will measure.</li>
              <li>Something that will connect.</li>
              <li>Something that will enable.</li>
              <li>Something that will create opportunity.</li>
            </ul>
          </div>
        </section>

        {/* 5. Stay Connected */}
        <section className="border-b border-border bg-muted px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Be the first to know.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Something is being built behind the Blackbox.
          </p>
          <div className="mt-8">
            <NotifyForm />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link href="#" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </section>
      </main>

      {/* 6. Final screen */}
      <footer className="px-4 py-16 text-center sm:px-6">
        <BlackboxLogo className="mx-auto h-8 w-auto" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">Xclusively Inclusive.</p>
        <p className="mt-6 text-sm font-semibold text-primary">The box opens — 3 December 2026.</p>
      </footer>
    </>
  );
}
