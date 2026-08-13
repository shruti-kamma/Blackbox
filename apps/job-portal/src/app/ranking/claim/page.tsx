import { ClaimContent } from "@blackbox/module-claim";

interface ClaimPageProps {
  searchParams: Promise<{ org?: string }>;
}

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const { org } = await searchParams;
  return <ClaimContent orgSlug={org} />;
}
