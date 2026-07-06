"use client";

import { ToolCallStatus } from "@copilotkit/react-core/v2";
import { SunMoonLoader } from "./SunMoonLoader";
import { WeatherCard, type WeatherData } from "./WeatherCard";

/**
 * In-chat renderer for the getWeather backend tool: a sun-to-moon
 * morph while the call is streaming/executing, then the animated
 * weather card once the JSON result lands.
 */
export function GetWeatherRender({
  args,
  status,
  result,
}: {
  name: string;
  toolCallId: string;
  args: Partial<{ city: string }>;
  status: ToolCallStatus;
  result?: string;
}) {
  if (status !== ToolCallStatus.Complete) {
    return (
      <div className="wxcard wxcard-loading">
        <SunMoonLoader size={52} />
        <div className="wxcard-loading-text">
          Checking the sky{args.city ? ` over ${args.city}` : ""}…
        </div>
      </div>
    );
  }

  const data = parseWeather(result, args.city);
  return <WeatherCard data={data} />;
}

function parseWeather(result: string | undefined, city?: string): WeatherData {
  try {
    const parsed = JSON.parse(result ?? "");
    if (parsed && typeof parsed === "object" && "ok" in parsed) {
      return parsed as WeatherData;
    }
  } catch {
    // fall through - treat the raw result as a plain-text summary
  }
  return { ok: false, city: city ?? "Unknown", summary: result || "No data." };
}
