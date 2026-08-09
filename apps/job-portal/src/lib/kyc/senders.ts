// Dev mode (default): log the code server-side instead of actually sending
// an email/SMS — there's no provider account wired up yet. Swap this file
// for a real implementation (e.g. Resend/SMTP for email, Twilio/MSG91 for
// SMS) when one is chosen; nothing else in the KYC flow needs to change.
function isDevMode(): boolean {
  return process.env.KYC_DEV_MODE !== "false";
}

export async function sendEmailOtp(email: string, code: string): Promise<void> {
  if (isDevMode()) {
    console.log(`[KYC DEV MODE] Email OTP for ${email}: ${code} (would be emailed in production)`);
    return;
  }
  throw new Error("No real email provider configured. Set KYC_DEV_MODE=true or wire a provider in senders.ts.");
}

export async function sendPhoneOtp(phone: string, code: string): Promise<void> {
  if (isDevMode()) {
    console.log(`[KYC DEV MODE] Phone OTP for ${phone}: ${code} (would be texted in production)`);
    return;
  }
  throw new Error("No real SMS provider configured. Set KYC_DEV_MODE=true or wire a provider in senders.ts.");
}

export function devCodeVisible(): boolean {
  return isDevMode();
}
