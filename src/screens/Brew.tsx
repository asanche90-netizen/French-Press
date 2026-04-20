import { useEffect, useMemo, useRef, useState } from "react";
import type { RecipeOutput, Unit } from "../lib/types";

type Screen = "home" | "brew" | "complete";

type Props = {
  recipe: RecipeOutput;
  unit: Unit;
  onNavigate: (screen: Screen) => void;
};

type StepId =
  | "bloom-pour"
  | "bloom"
  | "pour-remaining"
  | "steep"
  | "press"
  | "enjoy";

type Step = {
  id: StepId;
  name: string;
  title: string;
  baseSubtitle: string;
  duration: number;
};

const OZ_PER_ML = 0.033814;

function buildSteps(recipe: RecipeOutput, unit: Unit): Step[] {
  const metric = unit === "metric";
  const bloomStr = metric
    ? `${Math.round(recipe.bloomMl)} ml`
    : `${(recipe.bloomMl * OZ_PER_ML).toFixed(1)} fl oz`;
  const waterStr = metric ? `${recipe.waterMl} ml` : `${recipe.waterOz} fl oz`;

  return [
    {
      id: "bloom-pour",
      name: "Pour bloom water",
      title: "Pour bloom water.",
      baseSubtitle: `Pour ${bloomStr} slowly over grounds.`,
      duration: 10,
    },
    {
      id: "bloom",
      name: "Bloom",
      title: "Bloom.",
      baseSubtitle: "Swirl gently. CO\u2082 is releasing.",
      duration: 45,
    },
    {
      id: "pour-remaining",
      name: "Pour remaining water",
      title: "Pour remaining water.",
      baseSubtitle: `Top up to ${waterStr} in a spiral.`,
      duration: 15,
    },
    {
      id: "steep",
      name: "Steep",
      title: "Steep.",
      baseSubtitle: "Lid on. Plunger up. Wait.",
      duration: Math.max(0, recipe.steepSec - 70),
    },
    {
      id: "press",
      name: "Press",
      title: "Press.",
      baseSubtitle: "Slow and steady, about 20 seconds.",
      duration: 20,
    },
    {
      id: "enjoy",
      name: "Enjoy",
      title: "Enjoy.",
      baseSubtitle: "Decant now to avoid over-extraction.",
      duration: 0,
    },
  ];
}

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

export default function Brew({ recipe, unit, onNavigate }: Props) {
  const steps = useMemo(() => buildSteps(recipe, unit), [recipe, unit]);
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
  const totalSteps = steps.length;
  const timedSteps = steps.filter((s) => s.duration > 0);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const advance = () => {
    const nextIndex = currentStepIndexRef.current + 1;
    const nextStep = stepsRef.current[nextIndex];
    if (!nextStep) return;
    if (nextStep.duration === 0) {
      onNavigateRef.current("complete");
    } else {
      setCurrentStepIndex(nextIndex);
      setTimerSec(nextStep.duration);
    }
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

  // Derive subtitle with steep-specific swap
  const subtitle = (() => {
    if (step.id === "steep") {
      const half = step.duration / 2;
      if (timerSec > 0 && timerSec <= half) {
        return "Break the crust, skim the foam.";
      }
    }
    return step.baseSubtitle;
  })();

  // Fraction of time remaining: 1 at start, 0 at end.
  const progress = step.duration > 0 ? timerSec / step.duration : 0;

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
            {currentStepIndex + 1} of {totalSteps}
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center gap-10 pt-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-light tracking-tight text-ink">
              {step.title}
            </h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>

          <TimerRing
            timerSec={timerSec}
            progress={progress}
            showTime={step.duration > 0}
          />

          <ul className="flex w-full flex-col gap-3">
            {timedSteps.map((s, i) => {
              const isCompleted = i < currentStepIndex;
              const isActive = i === currentStepIndex;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <StepDot state={isCompleted ? "done" : isActive ? "active" : "upcoming"} />
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
                    {formatTime(isActive ? timerSec : s.duration)}
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
            className="flex-1 rounded-full border border-hairline py-3 text-sm font-medium text-ink hover:bg-hairline/30"
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
  showTime,
}: {
  timerSec: number;
  progress: number;
  showTime: boolean;
}) {
  const size = 240;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  // Stroke shrinks as time elapses: offset = C at progress=0, offset = 0 at progress=1
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
          {showTime ? formatTime(timerSec) : "—"}
        </span>
      </div>
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
