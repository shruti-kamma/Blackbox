import { getOrg } from "@blackbox/rankings-data";

export interface ClaimContentProps {
  orgSlug?: string;
}

// Placeholder landing for the "Claim record" CTA (see VerificationLadder).
// No claim/verification flow exists yet — this just confirms the request
// was understood and sets expectations, per docs/decisions.md.
export async function ClaimContent({ orgSlug }: ClaimContentProps) {
  const org = orgSlug ? await getOrg(orgSlug) : undefined;

  return (
    <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Claim a record</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">
          {org ? (
            <>
              Claiming isn&rsquo;t live yet for{" "}
              <strong className="text-foreground">{org.name}</strong>.
            </>
          ) : (
            "Claiming isn't live yet."
          )}{" "}
          Once it is, an authorized representative will be able to verify their organization&rsquo;s
          identity, submit supporting data, and move the record up the verification ladder toward
          a certified score. Check back soon.
        </p>
      </div>
    </main>
  );
}
