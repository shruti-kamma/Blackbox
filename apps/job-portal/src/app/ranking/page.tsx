import { redirect } from "next/navigation";

// Companies and universities are separate rankings, not tabs on a shared
// page — the section root just picks the default (ported from apps/rankings).
export default function RankingHomePage() {
  redirect("/ranking/companies");
}
