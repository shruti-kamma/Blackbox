import { Masthead } from "@/components/ranking/masthead";
import { MethodologyContent } from "@blackbox/module-methodology";

export default function MethodologyPage() {
  return (
    <>
      <Masthead active="methodology" />
      <MethodologyContent />
    </>
  );
}
