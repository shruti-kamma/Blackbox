// Only the 5 SDGs directly relevant to Blackbox's work, per the brief —
// not all 17. Icons are original simple numbered badges (see
// sdg-section.tsx), not the official UN artwork, since external assets
// can't be fetched in this environment.
export interface SdgEntry {
  number: number;
  title: string;
  copy: string;
}

export const RELEVANT_SDGS: SdgEntry[] = [
  {
    number: 1,
    title: "No Poverty",
    copy: "Employment, livelihoods and enterprise can help persons with disabilities and their families move towards greater economic independence.",
  },
  {
    number: 4,
    title: "Quality Education",
    copy: "We work to strengthen access, participation and pathways from education to opportunity.",
  },
  {
    number: 8,
    title: "Decent Work & Economic Growth",
    copy: "Our employment initiatives focus on productive employment and decent work for persons with disabilities.",
  },
  {
    number: 10,
    title: "Reduced Inequalities",
    copy: "We work to reduce barriers that prevent persons with disabilities from participating fully in education, employment and society.",
  },
  {
    number: 17,
    title: "Partnerships for the Goals",
    copy: "Our model depends on people, institutions and organisations working together.",
  },
];
