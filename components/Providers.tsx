"use client";

import type { ReactNode } from "react";
import { CopilotKit, defineToolCallRenderer } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { GetWeatherRender } from "./tool-render/GetWeatherRender";

// Renderers for backend tool calls (frontend tools carry their own
// `render` in useFrontendTool). Defined once at module scope so the
// registration is stable across re-renders.
const renderToolCalls = [
  defineToolCallRenderer({
    name: "getWeather",
    args: z.object({ city: z.string() }),
    render: GetWeatherRender,
  }),
];

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" renderToolCalls={renderToolCalls}>
      {children}
    </CopilotKit>
  );
}
