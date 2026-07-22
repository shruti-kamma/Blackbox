import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-4 px-4 py-24">
      <h1 className="text-3xl font-semibold text-foreground">
        Inclusive hiring, matched on what actually matters.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Blackbox Jobs matches candidates with disabilities to roles based on disability-category fit,
        skills, education, experience, and location — so candidates only see jobs they&apos;re a real fit
        for, and hiring managers see applicants who already clear the bar.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/signup"
          className="flex h-touch-target items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="flex h-touch-target items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-foreground"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
