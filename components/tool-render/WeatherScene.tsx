"use client";

import { useId } from "react";

/**
 * Animated SVG weather scene. Picks a scene from the OpenWeather
 * condition id (2xx storm, 3xx/5xx rain, 6xx snow, 7xx mist,
 * 800 clear, 80x clouds) and day/night flag. All animation is
 * self-contained CSS inside the SVG; ids are namespaced with useId
 * so several cards can coexist in the chat history.
 */
export function WeatherScene({
  conditionId,
  isDay,
  size = 96,
}: {
  conditionId: number;
  isDay: boolean;
  size?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const kind = sceneKind(conditionId);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${kind} ${isDay ? "day" : "night"}`}
    >
      <style>{css(uid)}</style>
      <defs>
        <radialGradient id={`${uid}-sun`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="60%" stopColor="#FFCE54" />
          <stop offset="100%" stopColor="#F7A93B" />
        </radialGradient>
        <radialGradient id={`${uid}-moon`} cx="42%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#F4F6FB" />
          <stop offset="70%" stopColor="#D9DFEC" />
          <stop offset="100%" stopColor="#B9C4DA" />
        </radialGradient>
        <linearGradient id={`${uid}-cloud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D7E1EC" />
        </linearGradient>
        <linearGradient id={`${uid}-cloud-dark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9FB0C3" />
          <stop offset="100%" stopColor="#6B7C91" />
        </linearGradient>
        <mask id={`${uid}-crescent`}>
          <circle cx="60" cy="52" r="20" fill="#fff" />
          <circle cx="70" cy="44" r="17" fill="#000" />
        </mask>
      </defs>

      {kind === "clear" && isDay && (
        <g className="wx-center">
          <g className="wx-rays">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="58"
                y="16"
                width="4"
                height="14"
                rx="2"
                fill="#FFCE54"
                transform={`rotate(${i * 45} 60 60)`}
              />
            ))}
          </g>
          <circle className="wx-sun-disc" cx="60" cy="60" r="21" fill={`url(#${uid}-sun)`} />
        </g>
      )}

      {kind === "clear" && !isDay && (
        <g>
          <g mask={`url(#${uid}-crescent)`}>
            <circle cx="60" cy="52" r="20" fill={`url(#${uid}-moon)`} />
          </g>
          <circle className="wx-star s1" cx="30" cy="34" r="2" fill="#EAF0FF" />
          <circle className="wx-star s2" cx="90" cy="28" r="1.6" fill="#EAF0FF" />
          <circle className="wx-star s3" cx="82" cy="72" r="1.8" fill="#EAF0FF" />
          <circle className="wx-star s4" cx="26" cy="66" r="1.4" fill="#EAF0FF" />
        </g>
      )}

      {kind === "clouds" && (
        <g>
          {isDay ? (
            <circle className="wx-sun-peek" cx="44" cy="42" r="15" fill={`url(#${uid}-sun)`} />
          ) : (
            <g mask={`url(#${uid}-crescent)`} transform="translate(-14 -14) scale(0.8)">
              <circle cx="60" cy="52" r="20" fill={`url(#${uid}-moon)`} />
            </g>
          )}
          <g className="wx-cloud-a">
            <Cloud fill={`url(#${uid}-cloud)`} />
          </g>
          <g className="wx-cloud-b" transform="translate(26 16) scale(0.62)">
            <Cloud fill={`url(#${uid}-cloud)`} />
          </g>
        </g>
      )}

      {(kind === "rain" || kind === "storm") && (
        <g>
          <g className="wx-cloud-a">
            <Cloud fill={kind === "storm" ? `url(#${uid}-cloud-dark)` : `url(#${uid}-cloud)`} />
          </g>
          {kind === "storm" && (
            <path
              className="wx-bolt"
              d="M62 66 L52 84 L60 84 L54 100 L72 78 L63 78 L70 66 Z"
              fill="#FFD452"
            />
          )}
          <g className={kind === "storm" ? "wx-rain wx-rain-offset" : "wx-rain"}>
            {[34, 48, 62, 76, 90].map((x, i) => (
              <line
                key={x}
                className={`wx-drop d${i}`}
                x1={x}
                y1="70"
                x2={x - 4}
                y2="82"
                stroke="#7FB4E8"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      )}

      {kind === "snow" && (
        <g>
          <g className="wx-cloud-a">
            <Cloud fill={`url(#${uid}-cloud)`} />
          </g>
          {[36, 52, 68, 84].map((x, i) => (
            <circle
              key={x}
              className={`wx-flake f${i}`}
              cx={x}
              cy="74"
              r="3"
              fill="#F2F8FF"
            />
          ))}
        </g>
      )}

      {kind === "mist" && (
        <g stroke="#E6EDF5" strokeWidth="6" strokeLinecap="round" opacity="0.9">
          <line className="wx-fog g0" x1="26" y1="44" x2="86" y2="44" />
          <line className="wx-fog g1" x1="36" y1="58" x2="98" y2="58" />
          <line className="wx-fog g2" x1="22" y1="72" x2="80" y2="72" />
          <line className="wx-fog g3" x1="40" y1="86" x2="94" y2="86" />
        </g>
      )}
    </svg>
  );
}

function Cloud({ fill }: { fill: string }) {
  return (
    <g>
      <ellipse cx="60" cy="56" rx="26" ry="16" fill={fill} />
      <circle cx="44" cy="50" r="13" fill={fill} />
      <circle cx="72" cy="46" r="15" fill={fill} />
    </g>
  );
}

function sceneKind(id: number): "storm" | "rain" | "snow" | "mist" | "clear" | "clouds" {
  if (id >= 200 && id < 300) return "storm";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "mist";
  if (id === 800) return "clear";
  return "clouds";
}

function css(uid: string) {
  return `
  @keyframes ${uid}-spin { to { transform: rotate(360deg); } }
  @keyframes ${uid}-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes ${uid}-drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(7px); } }
  @keyframes ${uid}-drift2 { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-9px); } }
  @keyframes ${uid}-fall {
    0% { transform: translateY(0); opacity: 0; }
    25% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(22px); opacity: 0; }
  }
  @keyframes ${uid}-snowfall {
    0% { transform: translate(0, 0); opacity: 0; }
    25% { opacity: 1; }
    100% { transform: translate(5px, 26px); opacity: 0; }
  }
  @keyframes ${uid}-flash {
    0%, 86%, 100% { opacity: 0; }
    88%, 94% { opacity: 1; }
    91% { opacity: 0.4; }
  }
  @keyframes ${uid}-twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
  @keyframes ${uid}-fog {
    0%,100% { transform: translateX(0); opacity: .55; }
    50% { transform: translateX(10px); opacity: .95; }
  }
  .wx-rays { transform-origin: 60px 60px; animation: ${uid}-spin 26s linear infinite; }
  .wx-sun-disc { transform-origin: 60px 60px; animation: ${uid}-breathe 4.5s ease-in-out infinite; }
  .wx-sun-peek { transform-origin: 44px 42px; animation: ${uid}-breathe 5s ease-in-out infinite; }
  .wx-cloud-a { animation: ${uid}-drift 7s ease-in-out infinite; }
  .wx-cloud-b { animation: ${uid}-drift2 9s ease-in-out infinite; }
  .wx-drop { animation: ${uid}-fall 1.3s linear infinite; }
  .wx-drop.d1 { animation-delay: .25s; } .wx-drop.d2 { animation-delay: .55s; }
  .wx-drop.d3 { animation-delay: .1s; } .wx-drop.d4 { animation-delay: .4s; }
  .wx-rain-offset { animation-delay: .2s; }
  .wx-bolt { transform-origin: 60px 66px; animation: ${uid}-flash 2.6s ease-in-out infinite; }
  .wx-flake { animation: ${uid}-snowfall 2.4s linear infinite; }
  .wx-flake.f1 { animation-delay: .6s; } .wx-flake.f2 { animation-delay: 1.2s; }
  .wx-flake.f3 { animation-delay: .3s; }
  .wx-star { animation: ${uid}-twinkle 2.8s ease-in-out infinite; }
  .wx-star.s2 { animation-delay: .7s; } .wx-star.s3 { animation-delay: 1.4s; }
  .wx-star.s4 { animation-delay: 2.1s; }
  .wx-fog { animation: ${uid}-fog 5s ease-in-out infinite; }
  .wx-fog.g1 { animation-delay: .8s; } .wx-fog.g2 { animation-delay: 1.6s; }
  .wx-fog.g3 { animation-delay: 2.4s; }
  `;
}
