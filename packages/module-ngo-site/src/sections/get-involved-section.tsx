import { GET_INVOLVED_OPTIONS } from "../data/get-involved";

// CTA buttons are functional placeholders (per the brief) — each just
// scrolls to Contact, where a real (if unwired) form exists. None of
// these connect to a payment/volunteer-signup backend yet.
export function GetInvolvedSection() {
  return (
    <section id="get-involved" className="scroll-mt-16 border-b border-border py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">There is a role for everyone.</h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GET_INVOLVED_OPTIONS.map((option) => (
            <a
              key={option.title}
              href="#contact"
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-foreground">{option.title}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
