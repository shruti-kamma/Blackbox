export interface VpoStatement {
  label: "Vision" | "Mission" | "Objective";
  copy: string;
}

export const VISION_MISSION_OBJECTIVE: VpoStatement[] = [
  { label: "Vision", copy: "A truly inclusive India where persons with disabilities participate fully in society and the economy." },
  {
    label: "Mission",
    copy: "To close the gap between inclusion by intent and inclusion in reality by connecting data, institutions, talent and opportunity.",
  },
  {
    label: "Objective",
    copy: "To create measurable pathways from education to employment, employment to economic participation, and participation to greater independence.",
  },
];

export interface CoreValue {
  title: string;
  description: string;
}

export const CORE_VALUES: CoreValue[] = [
  { title: "Inclusion", description: "Everyone belongs. Everyone contributes." },
  { title: "Evidence", description: "We measure before we claim." },
  { title: "Opportunity", description: "We focus on what people can do, not what limits them." },
  { title: "Collaboration", description: "People, Policy and Partnerships can create exponential change." },
  { title: "Action", description: "Ideas matter when they translate into outcomes." },
];
