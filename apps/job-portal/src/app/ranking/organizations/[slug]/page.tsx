import { OrgSnapshotContent } from "@blackbox/module-org-snapshot";

export { generateStaticParams } from "@blackbox/module-org-snapshot";

interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { slug } = await params;
  return <OrgSnapshotContent slug={slug} />;
}
