"use client";

import { useId } from "react";

/**
 * Loading animation for getWeather: a sun that smoothly becomes a
 * crescent moon and back. Rays retract while a masking disc slides in
 * to carve the crescent, the disc crossfades warm to pale, and stars
 * fade in on the night half of the cycle.
 */
export function SunMoonLoader({ size = 56 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="loading weather"
    >
      <style>{`
        @keyframes ${uid}-rays {
          0%, 38% { opacity: 1; transform: scale(1) rotate(0deg); }
          52%, 78% { opacity: 0; transform: scale(0.55) rotate(40deg); }
          92%, 100% { opacity: 1; transform: scale(1) rotate(90deg); }
        }
        @keyframes ${uid}-sunfade {
          0%, 42% { opacity: 1; }
          55%, 78% { opacity: 0; }
          92%, 100% { opacity: 1; }
        }
        @keyframes ${uid}-moonfade {
          0%, 42% { opacity: 0; }
          55%, 78% { opacity: 1; }
          92%, 100% { opacity: 0; }
        }
        @keyframes ${uid}-bite {
          0%, 40% { transform: translateX(26px); }
          58%, 80% { transform: translateX(0); }
          96%, 100% { transform: translateX(26px); }
        }
        @keyframes ${uid}-stars {
          0%, 46% { opacity: 0; }
          60%, 76% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
        .${uid}-rays { transform-origin: 60px 60px; animation: ${uid}-rays 5s ease-in-out infinite; }
        .${uid}-sun { animation: ${uid}-sunfade 5s ease-in-out infinite; }
        .${uid}-moon { animation: ${uid}-moonfade 5s ease-in-out infinite; }
        .${uid}-bite { animation: ${uid}-bite 5s ease-in-out infinite; }
        .${uid}-stars { animation: ${uid}-stars 5s ease-in-out infinite; }
      `}</style>
      <defs>
        <radialGradient id={`${uid}-g-sun`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="60%" stopColor="#FFCE54" />
          <stop offset="100%" stopColor="#F7A93B" />
        </radialGradient>
        <radialGradient id={`${uid}-g-moon`} cx="42%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F4F6FB" />
          <stop offset="70%" stopColor="#D9DFEC" />
          <stop offset="100%" stopColor="#B9C4DA" />
        </radialGradient>
        <mask id={`${uid}-m`}>
          <circle cx="60" cy="60" r="22" fill="#fff" />
          <circle className={`${uid}-bite`} cx="72" cy="50" r="19" fill="#000" />
        </mask>
      </defs>

      <g className={`${uid}-rays`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="58"
            y="14"
            width="4"
            height="13"
            rx="2"
            fill="#FFCE54"
            transform={`rotate(${i * 45} 60 60)`}
          />
        ))}
      </g>

      <circle className={`${uid}-sun`} cx="60" cy="60" r="22" fill={`url(#${uid}-g-sun)`} />
      <g mask={`url(#${uid}-m)`}>
        <circle className={`${uid}-moon`} cx="60" cy="60" r="22" fill={`url(#${uid}-g-moon)`} />
      </g>

      <g className={`${uid}-stars`} fill="#C9D6F2">
        <circle cx="26" cy="36" r="2" />
        <circle cx="94" cy="30" r="1.6" />
        <circle cx="90" cy="82" r="1.8" />
      </g>
    </svg>
  );
}
