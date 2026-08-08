import type { AccommodationType } from "./types";

// A job offering the outer key's accommodation also partially satisfies a
// candidate's need for one of the inner keys, at the given credit (0..1).
// Deliberately small and conservative — only pairings with a real,
// explainable relationship (e.g. remote work removes the need for
// accessible transportation), so a match score stays something a candidate
// or employer could be told the reasoning behind if they asked. Not
// symmetric: offering FLEXIBLE_HOURS doesn't imply REMOTE_FRIENDLY, so
// there's no reverse entry for that pairing.
export const ACCOMMODATION_EQUIVALENCE: Partial<
  Record<AccommodationType, Partial<Record<AccommodationType, number>>>
> = {
  REMOTE_FRIENDLY: {
    FLEXIBLE_HOURS: 0.6,
    ACCESSIBLE_TRANSPORTATION: 0.7,
    WHEELCHAIR_ACCESSIBLE_WORKSPACE: 0.7,
  },
  FLEXIBLE_HOURS: {
    EXTENDED_BREAKS: 0.4,
  },
  ASSISTIVE_TECHNOLOGY_STIPEND: {
    SCREEN_READER_SUPPORT: 0.4,
  },
};

// Best available credit toward `need` given everything a job actually
// offers — 1 for an exact match, the highest applicable partial-credit
// value otherwise, 0 if nothing offered relates to it at all.
export function accommodationCredit(need: AccommodationType, offered: AccommodationType[]): number {
  if (offered.includes(need)) return 1;
  let best = 0;
  for (const offeredType of offered) {
    const credit = ACCOMMODATION_EQUIVALENCE[offeredType]?.[need];
    if (credit && credit > best) best = credit;
  }
  return best;
}
