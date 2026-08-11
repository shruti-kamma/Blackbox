# Blackbox Jobs — Matching Algorithm
### Pitch deck source material

*Slide-by-slide content, ready to drop into a deck. Each section = one slide's worth of material, with supporting detail underneath for speaker notes.*

---

## Slide 1 — Title

**How Blackbox Jobs matches candidates to roles**
An explainable, accessibility-first scoring engine — not a black box.

Subtitle option: *"Every match comes with a reason attached."*

---

## Slide 2 — The problem with how hiring platforms match today

- Generic job platforms treat disability as a filter, at best — a checkbox that either blocks a candidate or does nothing.
- Matching algorithms on most platforms are opaque: a single "relevance score" with no explanation, which makes it impossible to audit for fairness — a real liability for accessibility-focused hiring.
- Accommodation needs and workplace offerings are almost never scored against each other directly — a candidate finds out a role can't accommodate them only *after* applying, or after being hired.
- One-size-fits-all scoring ignores that different disabilities create different priorities: a mobility-related need cares about physical/remote access; a hearing- or speech-related need cares about communication tooling and accommodation. Nobody scores that distinction.

---

## Slide 3 — Our approach: weighted, rule-based, fully explainable

- **Not a trained ML model.** An explicit, auditable formula — every score breaks down into named criteria with a plain-English reason attached to each one.
- Chosen deliberately: hiring decisions need to be *justifiable*, especially on a platform built around accessibility and fairness. A candidate or regulator can see exactly why a match scored what it scored.
- Every candidate profile and every job posting reduces to the same **8 criteria**. Each is scored independently 0–100%, then combined into one weighted score.
- The weights themselves are **not fixed** — they shift based on the candidate's own disability category (see Slide 5) and severity (see Slide 6). Two candidates with identical skills can get different overall scores against the same job, because what matters most to *them* is weighted differently.

---

## Slide 4 — The 8 scoring criteria

| # | Criterion | Default weight | What it checks |
|---|---|---|---|
| 1 | Disability-category fit | 13.5% | Full credit if the job is open to all categories, or overlaps the candidate's declared categories. Zero if the role targets categories the candidate didn't declare — the only criterion that can single-handedly disqualify an otherwise-strong match. |
| 2 | Accommodation fit | 6.3% | % of the candidate's stated accommodation needs the job's offerings cover — with partial credit via an equivalence table (e.g. remote-friendly partially covers an accessible-transportation need), not just exact-match. |
| 3 | Assistive technology fit | 2.7% | % of a job's preferred assistive tech (JAWS, NVDA, etc. — an open, growing vocabulary) the candidate already has experience with. |
| 4 | Skills overlap | 27% | The heaviest-weighted criterion — % of the job's required skills the candidate has. |
| 5 | Education | 13.5% | Full credit for meeting level + field; partial credit for level-only; proportional penalty for falling short. |
| 6 | Experience level | 13.5% | Exact match scores full; exceeding the requirement still scores highly (never penalized for being overqualified); falling short is penalized proportionally. |
| 7 | Location & remote fit | 13.5% | **Real distance-based scoring** (new) — see Slide 7. |
| 8 | **Assessment score** | **10%** | **New** — the candidate's one-time platform assessment result. See Slide 8. |

*(Weights sum to 100%. These are explicit policy numbers, tunable in one place — not scientifically derived, and fully visible to anyone reviewing how the platform works.)*

---

## Slide 5 — Weights adapt to disability category

Rather than one fixed weight vector for everyone, there are **4 named archetypes**, each a full 8-criterion vector that still sums to exactly 100%:

- **Default** — used when no category is declared.
- **Physical access** (Mobility, Chronic illness) — more emphasis on location/remote flexibility.
- **Tooling accommodation** (Visual, Hearing, Speech) — more emphasis on accommodation fit and assistive-tech fit.
- **Flexibility** (Cognitive, Mental health) — more emphasis on flexible hours/remote, less on exact field-of-study match.

A candidate with multiple categories gets the **elementwise average** of the relevant archetypes — since every archetype sums to 100%, an average of them always does too. No renormalization step to get wrong.

*Talking point: this isn't "one algorithm for disabled candidates" — it's a recognition that different disabilities create different priorities, encoded directly into the scoring weights.*

---

## Slide 6 — Severity-aware weighting

- Candidates can optionally record a **severity percentage** per disability category (and, for mobility, which body part is affected).
- The more significant a candidate's disability, the more their score shifts toward emphasizing accommodation fit and assistive-tech fit — up to a bounded, linear maximum shift, taken proportionally from every other criterion.
- Severity 0 leaves weights untouched; higher severity means "whether the job actually accommodates this" matters more to the final score than generic factors like education tier.
- Fully bounded and auditable — not a black-box adjustment, a documented, capped formula.

---

## Slide 7 — Real distance-based location matching *(shipped this round)*

**Before:** location scoring was exact city-name string matching — "Bangalore" mismatched with anything that wasn't spelled exactly "Bangalore."

**Now:**
- A curated coordinate table of ~100 major Indian cities, plus a real Haversine distance calculation.
- Location score gives **real proximity credit** — full credit at 0km, linearly decaying to zero by 300km — instead of a binary match/no-match.
- Falls back gracefully to the old exact-match behavior when a city isn't in the table yet, so nothing breaks for typos or unlisted places.
- The candidate's job feed is now **sorted nearest-first** — same proximity-first pattern as real-estate platforms like MagicBricks — layered on top of match score, not replacing it.
- **Verified against real data:** a candidate preferring Pune matched to a Mumbai job resolved to exactly 120km — accurate to the real-world distance.

---

## Slide 8 — The candidate assessment now feeds the match score *(shipped this round)*

- Every candidate completes a one-time, 40-question platform assessment before applying to any job (15 language, 15 aptitude, 10 personalized-to-their-skills — disability-adjusted, no timer, no camera/mic).
- The resulting score (0–100%) is now a real weighted input into the match formula — a candidate who has demonstrated stronger fundamentals scores measurably higher across every job they're matched to.
- **Never a penalty for not having taken it yet:** matches get computed continuously as jobs are posted, independent of assessment status — a candidate who hasn't completed the assessment gets a neutral partial-credit score (70%) on this criterion, not a zero. No one is punished for timing.
- Full detail on the assessment itself belongs on the platform-features deck (see the companion document) — this slide is specifically about how it plugs into matching.

---

## Slide 9 — Match threshold: a quality bar, not a raw ranking

- A candidate–job pair only becomes a visible "match" once the weighted score clears **60%**.
- Below the bar, the pair is scored but never surfaced.
- Candidates see a personalized feed of roles that already cleared the bar — not a raw list they have to filter themselves.
- Employers see a ranked shortlist of people who genuinely fit — not every applicant who happened to apply.

---

## Slide 10 — Built to scale, not just to demo

1. **Never computed live.** Posting a job doesn't wait for matching — it saves instantly; scoring happens afterward as a background job.
2. **Cheap filter before expensive scoring.** An indexed database query narrows the candidate pool to a plausible subset (disability category + location eligibility) before running the full 8-criterion formula on anyone.
3. **Batched, not bulk-loaded.** Even the narrowed subset processes in batches — memory use stays flat as the pool grows.
4. **Stored, not recomputed.** Every match that clears the threshold is written once, with its full breakdown. Feeds and dashboards just read the stored result.
5. **Re-checked on real change.** A candidate's matches only get re-scored when something the formula actually reads changes — a profile edit, an assessment completion, a new job posting — not on every page load.

Powered by a BullMQ + Redis background worker, decoupled from the request/response cycle entirely.

---

## Slide 11 — What makes this defensible

- **Auditable, not a black box.** Every score has a documented formula and a plain-English reason per criterion — critical for a platform built on fairness claims.
- **Disability-aware by construction**, not disability-blind with a filter bolted on.
- **Real signals, not proxies.** Real distance, not text matching. A real assessment score, not a self-reported claim. Real accommodation-need coverage, not a generic keyword match.
- **Policy is tunable in one place.** Every weight is a named constant, reviewable and adjustable without touching scoring logic.
- **Tested against real, live platform data** at every stage — not synthetic examples.

---

## Appendix — Quick stats to cite

- 8 weighted scoring criteria
- 4 disability-category-conditional weight archetypes
- 60% match threshold
- ~100-city curated coordinate table for real distance scoring
- 40-question assessment feeding a 10% weighted criterion
- 0% chance of a hardcoded/unexplained score — every match ships with a full breakdown
