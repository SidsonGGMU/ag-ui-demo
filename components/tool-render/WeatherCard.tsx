"use client";

import { WeatherScene } from "./WeatherScene";

export interface WeatherData {
  ok: boolean;
  city: string;
  country?: string;
  temp?: number;
  feelsLike?: number;
  description?: string;
  conditionId?: number;
  isDay?: boolean;
  humidity?: number;
  windSpeed?: number;
  sunrise?: number;
  sunset?: number;
  timezoneOffset?: number;
  summary?: string;
}

export function WeatherCard({ data }: { data: WeatherData }) {
  if (!data.ok) {
    return (
      <div className="wxcard wxcard-error">
        <WeatherScene conditionId={741} isDay size={56} />
        <div>
          <div className="wxcard-city">{data.city}</div>
          <div className="wxcard-desc">{data.summary ?? "Weather unavailable."}</div>
        </div>
      </div>
    );
  }

  const conditionId = data.conditionId ?? 800;
  const isDay = data.isDay ?? true;

  return (
    <div className="wxcard" style={{ background: gradient(conditionId, isDay) }}>
      <div className="wxcard-main">
        <div className="wxcard-city">
          {data.city}
          {data.country ? `, ${data.country}` : ""}
        </div>
        <div className="wxcard-temp">{data.temp}°</div>
        <div className="wxcard-desc">{data.description}</div>
        <div className="wxcard-chips">
          <span className="wxcard-chip">
            <ThermometerIcon /> feels {data.feelsLike}°
          </span>
          {data.humidity != null && (
            <span className="wxcard-chip">
              <DropIcon /> {data.humidity}%
            </span>
          )}
          {data.windSpeed != null && (
            <span className="wxcard-chip">
              <WindIcon /> {data.windSpeed} m/s
            </span>
          )}
        </div>
        {data.sunrise != null && data.sunset != null && (
          <div className="wxcard-sun-times">
            <span>
              <SunriseIcon /> {formatTime(data.sunrise, data.timezoneOffset)}
            </span>
            <span>
              <SunsetIcon /> {formatTime(data.sunset, data.timezoneOffset)}
            </span>
          </div>
        )}
      </div>
      <div className="wxcard-scene">
        <WeatherScene conditionId={conditionId} isDay={isDay} size={104} />
      </div>
    </div>
  );
}

function gradient(id: number, isDay: boolean): string {
  if (id >= 200 && id < 300) return "linear-gradient(135deg, #2F3542, #57606F)";
  if (id >= 300 && id < 600) return "linear-gradient(135deg, #4A6076, #7D93A8)";
  if (id >= 600 && id < 700) return "linear-gradient(135deg, #7F9DB8, #A9C4DB)";
  if (id >= 700 && id < 800) return "linear-gradient(135deg, #8395A7, #AAB7C2)";
  if (id === 800)
    return isDay
      ? "linear-gradient(135deg, #3D8FD9, #7FC4F5)"
      : "linear-gradient(135deg, #1B2A4A, #34497B)";
  return isDay
    ? "linear-gradient(135deg, #5D83A8, #9BB8D3)"
    : "linear-gradient(135deg, #2A3B58, #4A5D80)";
}

function formatTime(unix: number, offsetSeconds = 0): string {
  const d = new Date((unix + offsetSeconds) * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const iconProps = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function ThermometerIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z" />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2.7 5.9 8.8a8.6 8.6 0 1 0 12.2 0z" />
    </svg>
  );
}

function WindIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
      <path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}

function SunriseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 9V2m0 0L9 5m3-3 3 3" />
      <path d="M5.2 15.2 3.8 13.8M12 12a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5zm8.2 3.2 1.4-1.4M2 21h20" />
    </svg>
  );
}

function SunsetIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2v7m0 0-3-3m3 3 3-3" />
      <path d="M5.2 15.2 3.8 13.8M12 12a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5zm8.2 3.2 1.4-1.4M2 21h20" />
    </svg>
  );
}
