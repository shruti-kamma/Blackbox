"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";

const MAX_RECORDING_SECONDS = 120;

type Substate = "ready" | "recording" | "reviewing" | "uploading" | "reacting" | "reacted";

interface FlowQuestion {
  id: string;
  order: number;
  question: string;
  answer: string | null;
}

function pickMimeType(preferAudioOnly: boolean): string {
  const candidates = preferAudioOnly
    ? ["audio/webm;codecs=opus", "audio/webm"]
    : ["video/webm;codecs=vp8,opus", "video/webm"];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return preferAudioOnly ? "audio/webm" : "video/webm";
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

// Conversational, one-question-at-a-time video interview: camera/mic
// permission is requested once here (not per question), each question is
// spoken aloud, and a short AI reaction follows each answer before the
// candidate advances — all driven off a single shared MediaStream kept alive
// for the whole interview.
export function VideoInterviewFlow({
  jobId,
  initialQuestions,
  onFinished,
}: {
  jobId: string;
  initialQuestions: FlowQuestion[];
  onFinished: () => void;
}) {
  const firstUnanswered = initialQuestions.findIndex((q) => !q.answer);
  const initialIndex = firstUnanswered === -1 ? initialQuestions.length - 1 : firstUnanswered;
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<FlowQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [substate, setSubstate] = useState<Substate>(initialQuestions[initialIndex]?.answer ? "reacted" : "ready");
  const [reaction, setReaction] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const videoElRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedVideoBlobRef = useRef<Blob | null>(null);
  const recordedAudioBlobRef = useRef<Blob | null>(null);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // The <video> element only exists once `started` is true and substate is
  // "ready"/"recording" — attaching the stream has to happen after that
  // render, not synchronously inside startInterview() where the ref is null.
  useEffect(() => {
    if (started && (substate === "ready" || substate === "recording") && videoElRef.current && streamRef.current) {
      videoElRef.current.srcObject = streamRef.current;
      videoElRef.current.play().catch(() => {});
    }
  }, [started, substate]);

  async function startInterview() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setStarted(true);
      if (!current.answer) speak(current.question);
    } catch {
      setError("Couldn't access your camera/microphone — check your browser permissions and try again.");
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    setError(null);
    videoChunksRef.current = [];
    audioChunksRef.current = [];

    const videoRecorder = new MediaRecorder(stream, { mimeType: pickMimeType(false) });
    videoRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };
    videoRecorderRef.current = videoRecorder;

    const audioOnlyStream = new MediaStream(stream.getAudioTracks());
    const audioRecorder = new MediaRecorder(audioOnlyStream, { mimeType: pickMimeType(true) });
    audioRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    audioRecorderRef.current = audioRecorder;

    videoRecorder.start();
    audioRecorder.start();
    setSubstate("recording");
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_RECORDING_SECONDS) stopRecording();
        return s + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    const videoRecorder = videoRecorderRef.current;
    const audioRecorder = audioRecorderRef.current;
    if (!videoRecorder || !audioRecorder) return;

    let pending = 2;
    function maybeReview() {
      pending -= 1;
      if (pending > 0) return;
      recordedVideoBlobRef.current = new Blob(videoChunksRef.current, { type: pickMimeType(false) });
      recordedAudioBlobRef.current = new Blob(audioChunksRef.current, { type: pickMimeType(true) });
      setSubstate("reviewing");
    }
    videoRecorder.onstop = maybeReview;
    audioRecorder.onstop = maybeReview;
    videoRecorder.stop();
    audioRecorder.stop();
  }

  function discardAndRerecord() {
    recordedVideoBlobRef.current = null;
    recordedAudioBlobRef.current = null;
    setSubstate("ready");
  }

  async function uploadAndReact() {
    const videoBlob = recordedVideoBlobRef.current;
    const audioBlob = recordedAudioBlobRef.current;
    if (!videoBlob || !audioBlob) return;
    setSubstate("uploading");
    setError(null);
    try {
      const form = new FormData();
      form.append("video", videoBlob, "answer.webm");
      form.append("audio", audioBlob, "answer-audio.webm");
      const response = await fetch(`/api/jobs/${jobId}/interview/questions/${current.id}/video`, {
        method: "POST",
        body: form,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiClientError(body.error ?? "Upload failed", response.status);

      const answer: string = body.answer;
      setQuestions((qs) => qs.map((q) => (q.id === current.id ? { ...q, answer } : q)));

      setSubstate("reacting");
      try {
        const reactionResponse = await apiRequest<{ reaction: string }>(
          `/api/jobs/${jobId}/interview/questions/${current.id}/react`,
          { method: "POST" },
        );
        setReaction(reactionResponse.reaction);
        speak(reactionResponse.reaction);
      } catch {
        // Reaction is conversational polish, not core to the interview —
        // degrade quietly rather than blocking the candidate's progress.
        setReaction(null);
      }
      setSubstate("reacted");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to upload your answer — please try again.");
      setSubstate("reviewing");
    }
  }

  function nextQuestion() {
    const next = currentIndex + 1;
    setCurrentIndex(next);
    setReaction(null);
    setSubstate(questions[next].answer ? "reacted" : "ready");
    if (!questions[next].answer) speak(questions[next].question);
  }

  async function finish() {
    setFinishing(true);
    setError(null);
    try {
      await apiRequest(`/api/jobs/${jobId}/interview/submit`, { method: "POST", body: JSON.stringify({ answers: [] }) });
      stopCamera();
      onFinished();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit the interview");
      setFinishing(false);
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border p-4">
        <p className="text-sm text-foreground">
          This will ask for camera and microphone access once, then walk you through {questions.length}{" "}
          questions one at a time — each one read aloud, with a short reaction after you answer.
        </p>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button onClick={startInterview} className="self-start">
          Enable camera & start interview
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <p className="text-xs text-muted-foreground">
        Question {currentIndex + 1} of {questions.length}
      </p>
      <p className="text-sm font-medium text-foreground">{current.question}</p>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {(substate === "ready" || substate === "recording") && (
        <div className="flex flex-col gap-2">
          <video ref={videoElRef} muted playsInline className="w-full max-w-sm rounded-md bg-black" />
          {substate === "ready" ? (
            <Button size="sm" onClick={startRecording}>
              Start recording
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={stopRecording}>
                Stop recording
              </Button>
              <p className="text-xs text-danger">
                ● Recording — {seconds}s / {MAX_RECORDING_SECONDS}s
              </p>
            </div>
          )}
        </div>
      )}

      {substate === "reviewing" && recordedVideoBlobRef.current && (
        <div className="flex flex-col gap-2">
          <video
            src={URL.createObjectURL(recordedVideoBlobRef.current)}
            controls
            className="w-full max-w-sm rounded-md bg-black"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={uploadAndReact}>
              Use this answer
            </Button>
            <Button size="sm" variant="secondary" onClick={discardAndRerecord}>
              Re-record
            </Button>
          </div>
        </div>
      )}

      {substate === "uploading" && <p className="text-sm text-muted-foreground">Transcribing your answer…</p>}
      {substate === "reacting" && <p className="text-sm text-muted-foreground">…</p>}

      {substate === "reacted" && (
        <div className="flex flex-col gap-2">
          {current.answer && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">You said:</span> {current.answer}
            </p>
          )}
          {reaction && <p className="text-sm text-foreground">{reaction}</p>}
          {isLast ? (
            <Button onClick={finish} disabled={finishing} className="self-start">
              {finishing ? "Submitting…" : "Finish interview"}
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="self-start">
              Next question
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
