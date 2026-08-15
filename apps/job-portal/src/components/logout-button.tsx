"use client";

import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/nexo/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
