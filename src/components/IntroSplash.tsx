import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { resolvePublicUrl } from '../utils/assetUrl';

interface IntroSplashProps {
  onFinish: () => void;
}

export function IntroSplash({ onFinish }: IntroSplashProps) {
  const [fadingOut, setFadingOut] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const finishedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  const dismiss = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFadingOut(true);
    window.setTimeout(() => {
      onFinish();
    }, 300);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const displayDurationMs = shouldReduceMotion ? 1000 : 2100;
    const autoDismissTimer = window.setTimeout(dismiss, displayDurationMs);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(autoDismissTimer);
    };
  }, [shouldReduceMotion]);

  const splashImageSrc = resolvePublicUrl(
    'assets/aistudio/a_clean_transparent_background_png_style_illustrat_7ae40feb.png'
  );

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#FBF9F5] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] transition-opacity duration-300 ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="region"
      aria-label="Presentación inicial"
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
        className="flex flex-col items-center justify-center px-6"
      >
        {!imageFailed ? (
          <img
            src={splashImageSrc}
            alt="Proyecto DRK — Normativa IMSS–SNTSS"
            onError={() => {
              setImageFailed(true);
              dismiss();
            }}
            className="pointer-events-none max-h-[68dvh] w-auto max-w-[84vw] select-none rounded-2xl border border-stone-200/90 bg-white p-1.5 object-contain shadow-xl sm:max-h-[64dvh] sm:max-w-[420px]"
          />
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-6 text-center shadow-lg">
            <p className="font-serif text-xl font-semibold tracking-tight text-stone-900">
              Proyecto DRK
            </p>
            <p className="mt-1 text-xs text-stone-500">Normativa IMSS–SNTSS</p>
          </div>
        )}
      </motion.div>

      <button
        type="button"
        onClick={dismiss}
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] min-h-[44px] rounded-md bg-stone-900/90 px-4 py-2 text-xs font-medium tracking-wide text-white shadow-sm backdrop-blur-xs transition-colors hover:bg-stone-950 focus-visible:ring-2 focus-visible:ring-emerald-900 focus-visible:outline-none"
      >
        Omitir
      </button>
    </div>
  );
}

