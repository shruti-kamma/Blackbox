import { LeaderboardTable } from "./leaderboard-table";
import { getAllOrgs } from "@blackbox/rankings-data";

// Page content only — the shell composes this with <Masthead active="universities" />.
export async function UniversitiesLeaderboardContent() {
  const orgs = (await getAllOrgs())
    .filter((org) => org.type === "UNIVERSITY")
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">University Rankings</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Universities ranked on how accessible and inclusive they are to persons with
        disabilities, based on published disclosures.
      </p>

      <div className="mt-8">
        <LeaderboardTable
          orgs={orgs}
          caption="Universities ranked by accessibility and inclusion score"
        />
      </div>
    </main>
  );
}
