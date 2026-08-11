# Blackbox Jobs — Platform Overview
### Pitch deck source material

*Slide-by-slide content, ready to drop into a deck. Covers every feature shipped to date. Each section = one slide's worth of material.*

---

## Slide 1 — Title

**Blackbox Jobs**
An accessibility-first hiring platform — built for candidates with disabilities, and the employers who genuinely want to hire them.

---

## Slide 2 — The problem

- Job platforms treat accessibility as an afterthought: a disability checkbox with no real workflow behind it.
- Employer "commitments" to inclusive hiring are unverifiable — nothing holds them accountable if they quietly skip a qualified candidate.
- Candidates can't tell, before applying, whether a role can actually accommodate them — they find out after being rejected or, worse, after being hired.
- Resumes, profile fields, and interviews aren't designed with accessibility in mind — free-text everywhere, interviews that assume a candidate can use video and a microphone, no accommodation for how someone prefers to communicate.
- Screening tools (assessments, interviews) are rarely built to be fair across different disabilities — a hearing test question is meaningless to a deaf candidate, but most platforms ask it anyway.

---

## Slide 3 — What Blackbox Jobs is

Three roles, one platform: **Candidate**, **Employer**, **Admin** — each with dedicated tools, not a generic one-size-fits-all interface.

The mission runs through every feature: make accessibility **enforceable**, not just a form field. Every mechanism on this platform either verifies something real, gates on something real, or holds someone accountable for something real.

---

## Slide 4 — The candidate journey, end to end

1. **Sign up** → email + phone verified via one-time codes before anything else happens (KYC gate).
2. **Build a profile** → structured data, not a resume dump: skills, education, disability categories, accommodation needs, assistive technology, preferred communication mode.
3. **Complete a one-time assessment** → 40 questions, disability-adjusted, before applying to anything.
4. **Get matched** → a personalized, nearest-first feed of roles that already cleared the match threshold — not a raw list to filter.
5. **Check fit before applying** → a per-job ATS keyword-match score, right on the feed.
6. **Apply** → one click, with a resume auto-built from profile data, watermarked, ready to share outside the platform too.
7. **Move through a real pipeline** → Submitted → … → Interviewing → Offered, with an accommodation-fit gate the employer can't skip.
8. **Leave a review** → rate whether the employer actually honored accommodations and ran an accessible process.

---

## Slide 5 — Candidate KYC verification *(shipped this round)*

- Every candidate verifies both email and phone with a one-time code before profile building begins.
- A real verification gate, not a form field — every other candidate route stays locked until both are confirmed.
- Rate-limited against abuse (max resends per window).
- Existing candidates from before this shipped were grandfathered in as verified — nobody already on the platform got locked out by the change.

---

## Slide 6 — Profile building, redesigned *(shipped this round)*

- **Search-and-select instead of free typing.** Skills, education, preferred locations, and job categories are now pick-from-a-list fields backed by real submitted platform data — type to search, select, or add a genuinely new value that grows the shared list for the next candidate to find.
- **Real calendar date picker for date of birth** — a popup calendar, selection-only, no typing possible.
- **Disability & accommodation detail**, aligned to India's RPWD Act (21 categories): per-category severity, affected body part where relevant, and a controlled accommodation-needs checklist (or an explicit "I don't need any" confirmation, so the system never silently assumes).
- **Assistive technology list** — an open, growing vocabulary (JAWS, NVDA, specific mobility aids), matched later against what a job offers.
- **Preferred communication mode** — a separate signal from workplace accommodations: how a candidate wants to be reached *during hiring itself* (sign language interpreter, captions/transcript, extra response time, written-only). Editable any time, visible to HR everywhere they see the candidate.
- **Profile completion tracking with a real next step** — not just a percentage, a ranked "next best action" prioritized by actual impact on match quality.

---

## Slide 7 — The candidate assessment *(shipped this round — replaces the earlier AI interview)*

- **One-time, platform-wide.** Taken once after profile building, gates every job application from then on — not a per-job requirement.
- **40 questions, three sections:** 15 language (Listening/Speaking/Reading/Writing), 15 aptitude, 10 generated from the candidate's own listed skills.
- **Disability-adjusted by construction.** Which language sub-skills a candidate is even asked depends on their disability category — a deaf candidate never sees a Listening question, a candidate who can't speak never sees a Speaking one. No microphone, no camera, anywhere in this feature.
- **Personalized, with a safety net.** Skill questions come from the candidate's real listed skills; if they've listed none, or generation fails, the exam quietly substitutes more aptitude questions instead of ever blocking someone from starting.
- **Self-paced, autosaved.** No timer. Every answer autosaves as it's picked — a dropped connection or closed tab partway through a long exam doesn't cost a candidate their progress.
- **Scored, visible to HR, feeds matching.** Deterministic grading the moment it's submitted; the score and a language/aptitude/skills breakdown are visible to employers and admin, and factor into the candidate's match score on every job (see the companion matching-algorithm deck).

*Why this replaced the AI interview: no candidate should be blocked from or disadvantaged by a screening mechanism because of their disability. An interview that assumes video/audio access is itself an accessibility barrier — an MCQ exam that adapts its own question set to the candidate isn't.*

---

## Slide 8 — Resume, watermarked *(shipped this round)*

- A professional resume auto-built from profile data — Projects, Certifications, clean print-to-PDF.
- A per-job ATS keyword-match score shown right on the matched-jobs feed, so a candidate knows how they'll read to an applicant-tracking system *before* applying, not after being silently filtered out by one.
- **New:** every downloaded resume now carries a subtle, centered Blackbox Jobs watermark, blended into the document — verified against real generated PDFs, not just the on-screen preview.
- The same watermarked template is reused wherever an employer views a candidate's full profile — one document, everywhere.

---

## Slide 9 — Nearest-first job matching *(shipped this round)*

- Real distance-based location scoring — a curated Indian-city coordinate table and an actual distance calculation, not city-name text matching.
- The candidate's job feed sorts nearest-first, same proximity-first pattern as MagicBricks for real estate.
- Verified against real data: a candidate preferring Pune matched to a Mumbai job resolved to 120km — accurate to reality.
- Full mechanics belong on the companion matching-algorithm deck.

---

## Slide 10 — The accommodation-fit gate: the mission, enforced

- If a candidate needs something a job hasn't offered, the employer hits a **hard gate** the first time they try to move that candidate past "Submitted" — they must explicitly approve or decline the accommodation before proceeding.
- First-time-per-organization scoping — it only re-surfaces for genuinely new accommodation types, not every single applicant.
- A candidate who genuinely needs no accommodations confirms that explicitly once, rather than the system silently assuming it from an empty field.
- A notification bell surfaces every gap and status change as it happens.

*This is the mechanism that makes "accessibility-first" more than marketing language — an employer literally cannot silently ignore a stated need.*

---

## Slide 11 — Trust & accountability mechanisms

- **Guaranteed-interview badge** — an employer can commit to interviewing any candidate who has every skill marked essential. Deliberately kept separate from the overall blended match score (which mixes in factors like location the employer didn't choose) — shown as a badge on the job post.
- **Accountability, not punishment** — if an employer rejects a qualifying candidate before ever interviewing them, a notification fires. Informational, not automatic penalty, since a single skip can have a legitimate reason — but it's visible, not silent.
- **Employer reviews on disability inclusion** — candidates who've actually applied rate whether accommodations were honored and the process was accessible. Not a generic star rating. Anonymized publicly, fully visible to admin with a delete safety valve for abuse.
- **HR training signal at sign-up** — an optional question asking whether the hiring team has training on disability hiring, with a pointer to a real resource (Job Accommodation Network) if not. Kept internal for now since it's self-reported with no verification yet.

---

## Slide 12 — Employer-side hiring tools

- **Matched-candidate dashboard, grouped by job** — not one flat list across the whole org; a preview of top candidates per role, linking into that job's full match list.
- **Full candidate profile + resume, one click away** — the same watermarked template candidates use for themselves, gated to candidates who've actually matched or applied to that employer's own jobs.
- **Naukri-style application pipeline** — Submitted → … → Interviewing → Offered, with pipeline stats instead of a flat applicant list.
- **Candidate card with full accessibility context** — disability categories, severity/body-part detail, assistive tech, accommodation needs, preferred communication mode, and assessment score, all shown right where an employer is reviewing someone.
- **Assistive-tech insights** — an aggregate view of what technologies their applicant pool actually uses, for planning ahead rather than reacting per-candidate.
- **Candidate count at job-posting time** *(shipped this round)* — selecting which disability categories a role targets now shows a live platform-wide candidate count right next to each one, no separate lookup required.

---

## Slide 13 — Admin panel: platform-wide oversight

- **Overview dashboard** — needs-attention alerts (guaranteed-interview skips, stalled KYC, assessments abandoned mid-way), growth trends, platform-wide stats, all in one place.
- **Assessment visibility** *(shipped this round)* — how many candidates have started/completed the assessment, completion rate, average score.
- **Coverage view** — supply vs. demand broken down by disability category and accommodation type, so the team can see where the platform is well-matched and where it isn't, and where to recruit employers next.
- **Employer & candidate directories** — full drill-down into any record, with search and a disability-category filter so they stay usable as the platform grows. Per-employer HR-training visibility, review moderation, and per-candidate KYC/assessment status at a glance.

---

## Slide 14 — Under the hood

| Layer | Choice |
|---|---|
| Framework | Next.js App Router |
| Database | PostgreSQL via Prisma ORM |
| Background jobs | BullMQ + Redis worker |
| Repo structure | pnpm monorepo — app, matching engine, and DB schema as separate packages |
| AI provider | Groq — generates the 10 personalized skill-based assessment questions per candidate |
| Accessibility tech | Browser speech synthesis (assessment listening section), semantic HTML throughout |

Every feature above was built and then **live-verified against real running data** — not just unit tests — before being called done: real signups, real OTP codes, real generated PDFs inspected for correctness, real distance calculations checked against reality.

---

## Slide 15 — What makes this different from Naukri / LinkedIn / Indeed

- **Accessibility-first, not accessibility-bolted-on.** Every core workflow — profile, assessment, matching, application — was designed around disability from the start, not retrofitted with a filter.
- **Enforced, not self-reported.** The accommodation gate, the guaranteed-interview badge, and the review system all create real consequences for employer behavior — most platforms stop at a checkbox.
- **Explainable matching.** Every match score ships with a full, auditable breakdown — not a single opaque "relevance" number.
- **A screening mechanism built to be fair across disabilities**, not a generic exam or interview applied uniformly and hoping it works for everyone.

---

## Appendix — Quick stats to cite

- 3 roles, fully separated tooling (candidate / employer / admin)
- 21 disability categories supported (RPWD Act-aligned)
- 40-question one-time candidate assessment, disability-adjusted
- 1 hard accommodation-fit gate before an employer can move a candidate forward
- 3 trust & accountability mechanisms (guaranteed-interview badge, accountability notifications, employer reviews)
- 6 client-requested improvements shipped this round alone (KYC, search-select profile fields, resume watermark, assessment replacing the AI interview, nearest-first job sorting, employer disability-count insight)
