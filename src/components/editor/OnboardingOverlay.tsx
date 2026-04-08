import { useState, useEffect, useCallback } from "react";

interface Step {
  target: string;          // data-onboarding attribute value
  title: string;
  text: string;
  position: "bottom" | "top";
}

const STEPS: Step[] = [
  {
    target: "slide",
    title: "Слайд",
    text: "Нажми на текст, чтобы изменить его. Перетаскивай элементы, чтобы расположить как тебе нужно",
    position: "bottom",
  },
  {
    target: "menu-design",
    title: "Шаблоны",
    text: "Выбери любой готовый шаблон, который тебе нравится",
    position: "top",
  },
  {
    target: "menu-background",
    title: "Фон",
    text: "Загрузи фото или видео, либо выбери подходящий цвет фона",
    position: "top",
  },
  {
    target: "menu-text",
    title: "Текст",
    text: "Меняй шрифт, размер и цвет заголовка и основного текста",
    position: "top",
  },
  {
    target: "download-btn",
    title: "Экспорт",
    text: "Экспортируй слайд в PNG, PDF или видео",
    position: "bottom",
  },
];

interface OnboardingOverlayProps {
  active: boolean;
  onFinish: () => void;
}

const OnboardingOverlay = ({ active, onFinish }: OnboardingOverlayProps) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (!active) return;
    const s = STEPS[step];
    const el = document.querySelector(`[data-onboarding="${s.target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [active, step]);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [active, updateRect]);

  if (!active || !rect) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pad = 8;

  // clip-path: rect with a hole
  const cx = rect.left - pad;
  const cy = rect.top - pad;
  const cw = rect.width + pad * 2;
  const ch = rect.height + pad * 2;

  const clipPath = `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${cx}px ${cy}px,
    ${cx}px ${cy + ch}px,
    ${cx + cw}px ${cy + ch}px,
    ${cx + cw}px ${cy}px,
    ${cx}px ${cy}px
  )`;

  // Tooltip position
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.max(16, Math.min(rect.left, window.innerWidth - 280)),
    zIndex: 10001,
  };

  if (current.position === "bottom") {
    tooltipStyle.top = rect.bottom + pad + 12;
  } else {
    tooltipStyle.bottom = window.innerHeight - rect.top + pad + 12;
  }

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("onboarding_done", "1");
      onFinish();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_done", "1");
    onFinish();
  };

  return (
    <>
      {/* Backdrop with hole */}
      <div
        className="fixed inset-0 z-[10000] transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          clipPath,
        }}
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="w-64 rounded-2xl p-4 shadow-xl z-[10001]"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{ color: "#1a1a2e" }}>
              {current.title}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(26,26,46,0.4)" }}>
              {step + 1}/{STEPS.length}
            </span>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(26,26,46,0.7)" }}>
            {current.text}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-[11px] px-2 py-1 rounded-lg transition-all"
              style={{ color: "rgba(26,26,46,0.4)" }}
            >
              Пропустить
            </button>
            <button
              onClick={handleNext}
              className="text-[11px] font-semibold px-4 py-1.5 rounded-xl transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff",
              }}
            >
              {isLast ? "Готово" : "Далее"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingOverlay;
