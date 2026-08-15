import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/nexo/login");
  if (user.role !== "ADMIN") redirect("/rankings");

  return <>{children}</>;
}
