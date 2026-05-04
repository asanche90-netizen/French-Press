import { useEffect, useRef, useState } from "react";
import type { Step } from "../lib/steps";

type Screen = "method-select" | "home" | "brew" | "complete";

type Props = {
  steps: Step[];
  onNavigate: (screen: Screen) => void;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function playTone() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.close();
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 500;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => ctx.close();
  } catch {
    // ignore: audio not available
  }
}

function triggerHaptic() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(200);
    }
  } catch {
    // ignore: haptics not available
  }
}

export default function Brew({ steps, onNavigate }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSec, setTimerSec] = useState(() => steps[0].duration);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Refs let the interval callback read the latest values without
  // having to restart every render.
  const stepsRef = useRef(steps);
  const currentStepIndexRef = useRef(currentStepIndex);
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    stepsRef.current = steps;
    currentStepIndexRef.current = currentStepIndex;
    onNavigateRef.current = onNavigate;
  });

  const step = steps[currentStepIndex];
  // Last step is the terminal "Enjoy" sentinel; never displayed.
  const displayableSteps = steps.slice(0, -1);
  const totalDisplayable = displayableSteps.length;

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const advance = () => {
    const list = stepsRef.current;
    const nextIndex = currentStepIndexRef.current + 1;
    const nextStep = list[nextIndex];
    if (!nextStep) {
      onNavigateRef.current("complete");
      return;
    }
    // The terminal sentinel (last step, no timer) is never displayed —
    // skip straight to the Complete screen.
    if (nextIndex === list.length - 1 && nextStep.duration === 0) {
      onNavigateRef.current("complete");
      return;
    }
    setCurrentStepIndex(nextIndex);
    setTimerSec(nextStep.duration);
  };

  // Drive timer: pure decrement. Updater must be side-effect-free because
  // React StrictMode double-invokes setState updaters in dev.
  useEffect(() => {
    if (isPaused) return;
    if (step.duration === 0) return;

    intervalRef.current = window.setInterval(() => {
      setTimerSec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return clearTimer;
  }, [isPaused, currentStepIndex, step.duration]);

  // When timer crosses to zero, fire side effects and advance once.
  useEffect(() => {
    if (timerSec !== 0) return;
    if (step.duration === 0) return;
    clearTimer();
    playTone();
    triggerHaptic();
    advance();
  }, [timerSec, step.duration]);

  // Unmount safety
  useEffect(() => {
    return clearTimer;
  }, []);

  const handleNext = () => {
    clearTimer();
    advance();
    setIsPaused(false);
  };

  const handleCancel = () => {
    clearTimer();
    onNavigate("home");
  };

  // Subtitle: swap to midSubtitle past the halfway point of the current step's
  // timer (used by French press steep). For non-timed steps just render
  // the base subtitle.
  const subtitle = (() => {
    if (step.midSubtitle && step.duration > 0) {
      const half = step.duration / 2;
      if (timerSec > 0 && timerSec <= half) {
        return step.midSubtitle;
      }
    }
    return step.subtitle;
  })();

  // Fraction of time remaining: 1 at start, 0 at end.
  const progress = step.duration > 0 ? timerSec / step.duration : 0;
  const isTimedStep = step.duration > 0;

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5">
        <header className="flex items-center justify-between py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-muted hover:text-ink"
          >
            Cancel
          </button>
          <span className="text-sm text-muted tabular-nums">
            {currentStepIndex + 1} of {totalDisplayable}
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center gap-10 pt-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-light tracking-tight text-ink">
              {step.title}
            </h1>
            <p className="text-sm text-muted">{subtitle}</p>
            {step.tip && (
              <p className="text-xs text-muted">{step.tip}</p>
            )}
          </div>

          {isTimedStep ? (
            <TimerRing timerSec={timerSec} progress={progress} />
          ) : (
            <NoTimerSlot />
          )}

          <ul className="flex w-full flex-col gap-3">
            {displayableSteps.map((s, i) => {
              const isCompleted = i < currentStepIndex;
              const isActive = i === currentStepIndex;
              const stepHasTimer = s.duration > 0;
              const timeText = !stepHasTimer
                ? "—"
                : formatTime(isActive ? timerSec : s.duration);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <StepDot
                      state={
                        isCompleted ? "done" : isActive ? "active" : "upcoming"
                      }
                    />
                    <span
                      className={
                        isActive
                          ? "text-accent"
                          : isCompleted
                            ? "text-ink"
                            : "text-muted"
                      }
                    >
                      {s.name}
                    </span>
                  </span>
                  <span
                    className={`tabular-nums ${
                      isActive ? "text-accent" : "text-muted"
                    }`}
                  >
                    {timeText}
                  </span>
                </li>
              );
            })}
          </ul>
        </main>

        <footer className="flex gap-3 py-6">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            disabled={!isTimedStep}
            className="flex-1 rounded-full border border-hairline py-3 text-sm font-medium text-ink transition-opacity hover:bg-hairline/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-full bg-ink py-3 text-sm font-medium text-cream hover:opacity-90"
          >
            Next step ›
          </button>
        </footer>
      </div>
    </div>
  );
}

function TimerRing({
  timerSec,
  progress,
}: {
  timerSec: number;
  progress: number;
}) {
  const size = 240;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-5xl font-light tabular-nums text-ink">
          {formatTime(timerSec)}
        </span>
      </div>
    </div>
  );
}

function NoTimerSlot() {
  // Holds the same vertical space as the timer ring so non-timed steps
  // don't shift the layout.
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: 240, height: 240 }}
    >
      <p className="text-xs uppercase tracking-[0.15em] text-muted">
        Tap next when ready
      </p>
    </div>
  );
}

function StepDot({ state }: { state: "done" | "active" | "upcoming" }) {
  if (state === "done") {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border border-accent text-accent"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path
            d="M1.5 5.5 L4 8 L8.5 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border border-accent"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
    );
  }
  return (
    <span
      className="h-5 w-5 rounded-full border border-hairline"
      aria-hidden="true"
    />
  );
}
