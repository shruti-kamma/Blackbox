// Fixed, professional resume layout every candidate's auto-generated resume
// renders through — matched to a template provided by the client. Deliberately
// not configurable per-candidate (no per-user fonts/colors/layout): the whole
// point is one consistent, professional document generated from profile data.
const NAVY = "#1F3864";

function formatMonthYear(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function Bullets({ text }: { text: string | null }) {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="mt-1 list-disc pl-5 text-[10.5px] leading-snug text-neutral-800">
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-4 border-b-2 pb-0.5 text-[11px] font-bold tracking-wide uppercase"
      style={{ color: NAVY, borderColor: NAVY }}
    >
      {children}
    </h3>
  );
}

function EntryRow({
  title,
  date,
  subtitle,
}: {
  title: React.ReactNode;
  date?: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-bold text-neutral-900">{title}</p>
        {date && <p className="shrink-0 text-[10.5px] font-bold whitespace-nowrap text-neutral-900">{date}</p>}
      </div>
      {subtitle && <p className="text-[10.5px] italic text-neutral-600">{subtitle}</p>}
    </div>
  );
}

export interface ResumeEducation {
  id: string;
  level: string;
  fieldOfStudy: string | null;
  institution: string;
  graduationYear: number | null;
}

export interface ResumeWorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface ResumeProject {
  id: string;
  title: string;
  subtitle: string | null;
  techStack: string | null;
  date: string | null;
  description: string | null;
  url: string | null;
}

export interface ResumeCertification {
  id: string;
  title: string;
  issuer: string | null;
  date: string | null;
  url: string | null;
}

export interface ResumeProfile {
  fullName: string;
  headline: string | null;
  phone: string | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: ResumeEducation[];
  workExperience: ResumeWorkExperience[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  skills: { skill: { name: string } }[];
}

const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High school",
  DIPLOMA: "Diploma",
  ASSOCIATE: "Associate degree",
  BACHELORS: "Bachelor's degree",
  MASTERS: "Master's degree",
  DOCTORATE: "Doctorate",
  OTHER: "Other",
};

export function ResumeTemplate({ profile, email }: { profile: ResumeProfile; email: string | null }) {
  const contactLine = [
    email,
    profile.phone,
    profile.openToRemote
      ? "Open to remote"
      : profile.preferredLocations.length > 0
        ? profile.preferredLocations.join(", ")
        : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <article className="bg-white px-10 py-8 text-neutral-900">
      <header className="text-center">
        <h1 className="text-[19px] font-bold tracking-wide uppercase" style={{ color: NAVY }}>
          {profile.fullName}
        </h1>
        {profile.headline && <p className="mt-1 text-[11px] text-neutral-700">{profile.headline}</p>}
        {contactLine && <p className="mt-1 text-[10px] text-neutral-600">{contactLine}</p>}
      </header>
      <hr className="mt-3 border-t-2" style={{ borderColor: NAVY }} />

      {profile.education.length > 0 && (
        <section>
          <SectionHeading>Education</SectionHeading>
          <div className="mt-2 flex flex-col gap-2">
            {profile.education.map((edu) => (
              <EntryRow
                key={edu.id}
                title={
                  <>
                    {edu.institution} — {EDUCATION_LEVEL_LABELS[edu.level] ?? edu.level}
                    {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                  </>
                }
                date={edu.graduationYear ? String(edu.graduationYear) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {profile.workExperience.length > 0 && (
        <section>
          <SectionHeading>Experience</SectionHeading>
          <div className="mt-2 flex flex-col gap-3">
            {profile.workExperience.map((exp) => (
              <div key={exp.id}>
                <EntryRow
                  title={
                    <>
                      {exp.company} — {exp.title}
                    </>
                  }
                  date={`${formatMonthYear(exp.startDate)} – ${exp.isCurrent ? "Present" : formatMonthYear(exp.endDate)}`}
                />
                <Bullets text={exp.description} />
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.projects.length > 0 && (
        <section>
          <SectionHeading>Projects</SectionHeading>
          <div className="mt-2 flex flex-col gap-3">
            {profile.projects.map((p) => (
              <div key={p.id}>
                <EntryRow
                  title={
                    <>
                      {p.title}
                      {p.subtitle ? ` — ${p.subtitle}` : ""}
                      {p.techStack ? <span className="font-normal italic"> | {p.techStack}</span> : null}
                    </>
                  }
                  date={p.date ? formatMonthYear(p.date) : undefined}
                />
                <Bullets text={p.description} />
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.certifications.length > 0 && (
        <section>
          <SectionHeading>Certifications</SectionHeading>
          <ul className="mt-2 list-disc pl-5 text-[10.5px] leading-snug text-neutral-800">
            {profile.certifications.map((c) => (
              <li key={c.id}>
                {c.title}
                {c.issuer ? ` — ${c.issuer}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.skills.length > 0 && (
        <section>
          <SectionHeading>Skills</SectionHeading>
          <p className="mt-2 text-[10.5px] leading-snug text-neutral-800">
            {profile.skills.map((s) => s.skill.name).join(", ")}
          </p>
        </section>
      )}
    </article>
  );
}
