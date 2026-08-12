import { Masthead } from "@/components/ranking/masthead";
import { CompaniesLeaderboardContent } from "@blackbox/module-leaderboards";

export default function CompaniesPage() {
  return (
    <>
      <Masthead active="companies" />
      <CompaniesLeaderboardContent />
    </>
  );
}
