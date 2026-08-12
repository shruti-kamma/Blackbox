import { Masthead } from "@/components/ranking/masthead";
import { UniversitiesLeaderboardContent } from "@blackbox/module-leaderboards";

export default function UniversitiesPage() {
  return (
    <>
      <Masthead active="universities" />
      <UniversitiesLeaderboardContent />
    </>
  );
}
