import { LeaderboardTable } from "./leaderboard-table";
import { getAllOrgs } from "@blackbox/rankings-data";

// Page content only — the shell composes this with <Masthead active="companies" />.
export async function CompaniesLeaderboardContent() {
  const orgs = (await getAllOrgs())
    .filter((org) => org.type === "COMPANY")
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Company Rankings</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Companies ranked on how accessible and inclusive they are to persons with
        disabilities, based on published disclosures.
      </p>

      <div className="mt-8">
        <LeaderboardTable
          orgs={orgs}
          caption="Companies ranked by accessibility and inclusion score"
        />
      </div>
    </main>
  );
}
