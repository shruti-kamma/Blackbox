import { OrgSnapshotContent } from "@blackbox/module-org-snapshot";

// No generateStaticParams: real org slugs live only in Postgres, never
// known at build time, so this renders fully dynamically like every
// other data-backed route (see docs/decisions.md — removed after this
// caused a DYNAMIC_SERVER_USAGE crash in production: the empty static
// param list made Next.js attempt static optimization for a page that
// can never actually be statically generated).
interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { slug } = await params;
  return <OrgSnapshotContent slug={slug} />;
}
