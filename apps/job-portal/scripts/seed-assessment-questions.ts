import { prisma } from "@/lib/db";
import { ALL_SEED_QUESTIONS } from "@/lib/assessment/question-bank-seed";

// Loads the hand-authored language/aptitude question bank into
// AssessmentQuestion. Idempotent by (section, prompt) — safe to re-run after
// editing question-bank-seed.ts; existing rows for questions no longer in
// the seed file are left in place rather than deleted, since a candidate's
// CandidateAssessmentAnswer already snapshots content and never references
// this table by id.
async function main() {
  let created = 0;
  let skipped = 0;

  for (const q of ALL_SEED_QUESTIONS) {
    // Several WRITING questions deliberately reuse the same generic prompt
    // ("Choose the correctly written sentence.") with the real distinguishing
    // content in `options` — match on both, not just section+prompt, or
    // distinct questions get wrongly treated as duplicates of each other.
    const existing = await prisma.assessmentQuestion.findFirst({
      where: { section: q.section, prompt: q.prompt, options: { equals: q.options } },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.assessmentQuestion.create({
      data: {
        section: q.section,
        prompt: q.prompt,
        passage: q.passage ?? null,
        options: q.options,
        correctIndex: q.correctIndex,
      },
    });
    created++;
  }

  console.log(`Assessment question bank seeded: ${created} created, ${skipped} already present.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
