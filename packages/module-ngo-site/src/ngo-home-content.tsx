import { HeroSection } from "./sections/hero-section";
import { GapSection } from "./sections/gap-section";
import { EcosystemSection } from "./sections/ecosystem-section";
import { InitiativesSection } from "./sections/initiatives-section";
import { ApproachSection } from "./sections/approach-section";
import { ImpactSection } from "./sections/impact-section";
import { OpportunitiesSection } from "./sections/opportunities-section";
import { ViksitBharatSection } from "./sections/viksit-bharat-section";
import { SdgSection } from "./sections/sdg-section";
import { AboutSection } from "./sections/about-section";
import { ValuesSection } from "./sections/values-section";
import { KnowledgeSection } from "./sections/knowledge-section";
import { CareersSection } from "./sections/careers-section";
import { GetInvolvedSection } from "./sections/get-involved-section";
import { PartnersSection } from "./sections/partners-section";
import { NewsletterSection } from "./sections/newsletter-section";
import { ContactSection } from "./sections/contact-section";

// Composed in the exact order specified by the brief's "Homepage Flow"
// (section 29) — one continuous narrative page, nav items scroll-anchor
// into these sections rather than navigating to separate routes.
export function NgoHomeContent() {
  return (
    <main>
      <HeroSection />
      <GapSection />
      <EcosystemSection />
      <InitiativesSection />
      <ApproachSection />
      <ImpactSection />
      <OpportunitiesSection />
      <ViksitBharatSection />
      <SdgSection />
      <AboutSection />
      <ValuesSection />
      <KnowledgeSection />
      <CareersSection />
      <GetInvolvedSection />
      <PartnersSection />
      <NewsletterSection />
      <ContactSection />
    </main>
  );
}
