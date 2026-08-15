"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";

type Channel = "EMAIL" | "PHONE";

interface ChannelState {
  verified: boolean;
  sent: boolean;
  devCode: string | null;
  error: string | null;
  success: string | null;
  sending: boolean;
  verifying: boolean;
  code: string;
  cooldown: number;
}

const INITIAL_CHANNEL_STATE: ChannelState = {
  verified: false,
  sent: false,
  devCode: null,
  error: null,
  success: null,
  sending: false,
  verifying: false,
  code: "",
  cooldown: 0,
};

const LABELS: Record<Channel, string> = { EMAIL: "Email", PHONE: "Phone" };

export default function VerifyKycPage() {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [email, setEmail] = useState<ChannelState>(INITIAL_CHANNEL_STATE);
  const [phone, setPhone] = useState<ChannelState>(INITIAL_CHANNEL_STATE);
  const autoSentRef = useRef(false);

  const stateFor = (channel: Channel) => (channel === "EMAIL" ? email : phone);
  const setStateFor = (channel: Channel) => (channel === "EMAIL" ? setEmail : setPhone);

  async function sendCode(channel: Channel) {
    const set = setStateFor(channel);
    set((s) => ({ ...s, sending: true, error: null, success: null }));
    try {
      const result = await apiRequest<{ sent: true; devCode?: string }>("/api/auth/kyc/send-code", {
        method: "POST",
        body: JSON.stringify({ channel }),
      });
      set((s) => ({
        ...s,
        sending: false,
        sent: true,
        devCode: result.devCode ?? null,
        success: "Code sent.",
        cooldown: 30,
      }));
    } catch (err) {
      set((s) => ({
        ...s,
        sending: false,
        error: err instanceof ApiClientError ? err.message : "Couldn't send the code — try again",
      }));
    }
  }

  async function verify(channel: Channel) {
    const set = setStateFor(channel);
    const code = stateFor(channel).code;
    set((s) => ({ ...s, verifying: true, error: null, success: null }));
    try {
      await apiRequest("/api/auth/kyc/verify", { method: "POST", body: JSON.stringify({ channel, code }) });
      set((s) => ({ ...s, verifying: false, verified: true, success: "Verified." }));
    } catch (err) {
      set((s) => ({
        ...s,
        verifying: false,
        error: err instanceof ApiClientError ? err.message : "Couldn't verify — try again",
      }));
    }
  }

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ emailVerified: boolean; phoneVerified: boolean }>("/api/auth/kyc/status")
      .then((status) => {
        if (cancelled) return;
        if (status.emailVerified && status.phoneVerified) {
          router.replace("/nexo/candidate/profile");
          return;
        }
        setEmail((s) => ({ ...s, verified: status.emailVerified }));
        setPhone((s) => ({ ...s, verified: status.phoneVerified }));
        setLoadingStatus(false);
        if (!autoSentRef.current) {
          autoSentRef.current = true;
          if (!status.emailVerified) void sendCode("EMAIL");
          if (!status.phoneVerified) void sendCode("PHONE");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingStatus(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (email.verified && phone.verified) {
      router.push("/nexo/candidate/profile");
      router.refresh();
    }
  }, [email.verified, phone.verified, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmail((s) => (s.cooldown > 0 ? { ...s, cooldown: s.cooldown - 1 } : s));
      setPhone((s) => (s.cooldown > 0 ? { ...s, cooldown: s.cooldown - 1 } : s));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function renderPanel(channel: Channel) {
    const s = stateFor(channel);
    const set = setStateFor(channel);

    if (s.verified) {
      return (
        <div key={channel} className="rounded-md border border-border bg-muted p-4">
          <p className="text-sm font-medium text-foreground">{LABELS[channel]} verified ✓</p>
        </div>
      );
    }

    return (
      <div key={channel} className="flex flex-col gap-2 rounded-md border border-border p-4">
        <p className="text-sm font-medium text-foreground">{LABELS[channel]}</p>
        {s.devCode && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
            <strong>DEV MODE</strong> — code is <span className="font-mono">{s.devCode}</span> (would be{" "}
            {channel === "EMAIL" ? "emailed" : "texted"} in production)
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={s.code}
            onChange={(e) => set((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, "") }))}
            aria-label={`${LABELS[channel]} verification code`}
            className="h-touch-target flex-1 rounded-md border border-border bg-background px-3 text-foreground"
          />
          <Button
            type="button"
            onClick={() => verify(channel)}
            disabled={s.verifying || s.code.length !== 6}
          >
            {s.verifying ? "Checking…" : "Verify"}
          </Button>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => sendCode(channel)}
          disabled={s.sending || s.cooldown > 0}
        >
          {s.sending ? "Sending…" : s.cooldown > 0 ? `Resend code (${s.cooldown}s)` : s.sent ? "Resend code" : "Send code"}
        </Button>
        {s.error && (
          <p role="alert" className="text-sm text-danger">
            {s.error}
          </p>
        )}
      </div>
    );
  }

  if (loadingStatus) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-4 py-16">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Verify your details</h1>
        <p className="text-sm text-muted-foreground">
          One quick step before you build your profile — confirm the email and phone number you signed up with.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {renderPanel("EMAIL")}
        {renderPanel("PHONE")}
      </div>
    </main>
  );
}
