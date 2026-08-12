import { Masthead } from "@/components/ranking/masthead";
import { ClaimContent } from "@blackbox/module-claim";

interface ClaimPageProps {
  searchParams: Promise<{ org?: string }>;
}

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const { org } = await searchParams;

  return (
    <>
      <Masthead />
      <ClaimContent orgSlug={org} />
    </>
  );
}
