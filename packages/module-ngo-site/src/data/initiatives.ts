export interface Initiative {
  title: string;
  subtitle: string;
  description: string;
  flow?: string[]; // conceptual journey steps, shown as a small arrow chain
  stats?: string[]; // headline numbers instead of a flow, for stat-led cards
  ctaLabel: string;
  // Real routes for the two initiatives that already have working
  // products; the rest anchor into Get Involved since no dedicated page
  // exists for them yet (see docs/decisions.md — scope boundary noted
  // when this package was built).
  ctaHref: string;
}

export const INITIATIVES: Initiative[] = [
  {
    title: "Blackbox Index™",
    subtitle: "India's National Disability Ecosystem Exchange",
    description:
      "A data-driven benchmarking platform that assesses how effectively employers in India support persons with disabilities across the employment journey; how educational institutions enable the journey from enrolment to employment; and how states strengthen the systems connecting education, employment, accessibility and inclusion.",
    stats: ["100-point framework", "Live benchmarking"],
    ctaLabel: "Explore Index",
    ctaHref: "/blackbox-index",
  },
  {
    title: "Nexo",
    subtitle: "The employment platform",
    description:
      "Connecting persons with disabilities with employers, jobs, training, assessments and career pathways.",
    flow: ["Talent", "Prepare", "Assess", "Match", "Hire", "Progress"],
    ctaLabel: "Explore Opportunities",
    ctaHref: "/nexo",
  },
  {
    title: "10,000 Opportunities",
    subtitle: "One year. 1,000 employers. 1,000 educational institutions. 10,000 opportunities.",
    description:
      "A national initiative connecting India's education and employment ecosystems to create meaningful opportunities for persons with disabilities.",
    stats: ["1 year", "1,000 employers", "1,000 institutions", "10,000 opportunities"],
    ctaLabel: "Join the Challenge",
    ctaHref: "#get-involved",
  },
  {
    title: "Train & Hire",
    subtitle: "From capability to employment.",
    description:
      "Working with employers to understand requirements, prepare talent, assess candidates and create pathways to placement.",
    flow: ["Employer need", "Prepare", "Assess", "Shortlist", "Place", "Track"],
    ctaLabel: "Partner as an Employer",
    ctaHref: "#get-involved",
  },
  {
    title: "Scribe Network",
    subtitle: "Making examinations more accessible.",
    description:
      "Connecting persons who need scribes with trained and available volunteers to support access to examinations and educational opportunities.",
    flow: ["Candidate", "Scribe"],
    ctaLabel: "Join the Network",
    ctaHref: "#get-involved",
  },
  {
    title: "Micro Enterprises",
    subtitle: "Creating pathways to entrepreneurship.",
    description: "Supporting persons with disabilities to build enterprises, livelihoods and sustainable income.",
    flow: ["Idea", "Skill", "Enterprise", "Income"],
    ctaLabel: "Explore the Initiative",
    ctaHref: "#get-involved",
  },
];
