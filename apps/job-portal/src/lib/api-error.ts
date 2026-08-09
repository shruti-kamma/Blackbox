import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AssessmentRequiredError, ForbiddenError, KycRequiredError, UnauthorizedError } from "@/lib/auth/current-user";
import { AssessmentGenerationError } from "@/lib/assessment/skill-question-generator";
import { NotMatchedError } from "@/lib/applications";
import { NoDestinationError, RateLimitedError } from "@/lib/kyc/otp";

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof KycRequiredError) {
    return NextResponse.json({ error: error.message, code: "KYC_REQUIRED" }, { status: 403 });
  }
  if (error instanceof AssessmentRequiredError) {
    return NextResponse.json({ error: error.message, code: "ASSESSMENT_REQUIRED" }, { status: 403 });
  }
  if (error instanceof NoDestinationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof RateLimitedError) {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }
  if (error instanceof NotMatchedError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
  }
  if (error instanceof AssessmentGenerationError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
