import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";

// The only way an ADMIN row can ever exist — there is deliberately no signup
// path for this role. Run with `pnpm --filter job-portal seed:admin`,
// ADMIN_EMAIL/ADMIN_PASSWORD read from .env (or the shell environment).
// Upsert so re-running it (e.g. to rotate the password) is safe.
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin account ready: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
