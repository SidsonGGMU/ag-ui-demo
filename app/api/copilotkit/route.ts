import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { BuiltInAgent, defineTool } from "@copilotkit/runtime/v2";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { NextRequest } from "next/server";
import { z } from "zod";
import { log } from "@/lib/logger";

// If LMSTUDIO_MODEL is set, run against a local LM Studio server (an
// OpenAI-compatible endpoint) instead of the OpenAI cloud API.
const model = process.env.LMSTUDIO_MODEL
  ? createOpenAICompatible({
      name: "lmstudio",
      baseURL: process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
    })(process.env.LMSTUDIO_MODEL)
  : (process.env.OPENAI_MODEL ?? "openai/gpt-4o-mini");

const SYSTEM_PROMPT = `You are an app assistant connected to browser-side frontend tools and backend tools.

Important tool behavior:
- Continue with the remaining user request after a frontend tool succeeds.
- getWeather returns JSON whose result is already shown to the user as a visual weather card. Base your final text answer on its "summary" field; keep it short and do not repeat every metric.`;

const getWeather = defineTool({
  name: "getWeather",
  description:
    "Gets the current weather for a city. Backend tool - do not confuse with sayHello.",
  parameters: z.object({
    city: z.string().describe("City name, e.g. 'Grenoble'."),
  }),
  execute: async ({ city }) => {
    log("AGENT_TOOL_CALL", `getWeather city=${city}`);

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      log("BACKEND_TOOL_RESULT", "weather error: missing OPENWEATHER_API_KEY");
      return {
        ok: false,
        city,
        summary: "Weather lookup is not configured (missing OPENWEATHER_API_KEY).",
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    // Structured result: the frontend renders it as a weather card, and the
    // model reads `summary` for its final answer.
    let result: Record<string, unknown>;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        result = {
          ok: false,
          city,
          summary: `Could not get the weather for ${city}: ${data.message ?? res.statusText}.`,
        };
      } else {
        const description = data.weather?.[0]?.description ?? "unknown conditions";
        const temp = Math.round(data.main?.temp);
        const dt = data.dt ?? 0;
        result = {
          ok: true,
          city: data.name ?? city,
          country: data.sys?.country,
          temp,
          feelsLike: Math.round(data.main?.feels_like ?? temp),
          description,
          conditionId: data.weather?.[0]?.id ?? 800,
          isDay: dt >= (data.sys?.sunrise ?? 0) && dt < (data.sys?.sunset ?? Infinity),
          humidity: data.main?.humidity,
          windSpeed: data.wind?.speed,
          pressure: data.main?.pressure,
          clouds: data.clouds?.all,
          visibility: data.visibility,
          sunrise: data.sys?.sunrise,
          sunset: data.sys?.sunset,
          timezoneOffset: data.timezone ?? 0,
          summary: `The weather in ${data.name ?? city} is currently ${description}, ${temp}°C.`,
        };
      }
    } catch (err) {
      console.error("[COPILOTKIT_ERROR] getWeather fetch failed", err);
      result = {
        ok: false,
        city,
        summary: `Could not reach the weather service for ${city}.`,
      };
    }

    log("BACKEND_TOOL_RESULT", String(result.summary));

    return result;
  },
});

const agent = new BuiltInAgent({
  model,
  prompt: SYSTEM_PROMPT,
  tools: [getWeather],
  // Enough steps to: (1) call sayHello, (2) call getWeather once the
  // frontend result comes back, (3) produce the final text answer.
  maxSteps: 5,
  providerOptions: {
    // Forces OpenAI to emit tool calls one at a time instead of batching
    // multiple tool_call_ids into a single response. This is the actual
    // fix for the sayHello loop: the loop was caused by relying on
    // parallel tool calls, not by anything client-side.
    openai: {
      parallelToolCalls: false,
    },
  },
});

// Logging only, via the agent's own run-lifecycle subscriber (the
// non-deprecated way to observe a run). CopilotRuntime's `middleware`
// option is deprecated and crashes when paired with a v2 BuiltInAgent
// (it expects the classic message-conversion pipeline), so we don't use it.
agent.subscribe({
  onRunStartedEvent: ({ input }) => {
    try {
      const lastUserMessage = [...(input.messages ?? [])]
        .reverse()
        .find((m) => m?.role === "user");

      if (lastUserMessage) {
        log("USER_MESSAGE", String(lastUserMessage.content ?? ""));
      }
    } catch (err) {
      console.error("[LOGGING_ERROR] onRunStartedEvent", err);
    }
  },
  onToolCallEndEvent: ({ toolCallName, toolCallArgs }) => {
    try {
      log("AGENT_TOOL_CALL", `${toolCallName} args=${JSON.stringify(toolCallArgs)}`);
    } catch (err) {
      console.error("[LOGGING_ERROR] onToolCallEndEvent", err);
    }
  },
  onTextMessageEndEvent: ({ textMessageBuffer }) => {
    try {
      log("AGENT_FINAL_RESPONSE", textMessageBuffer);
    } catch (err) {
      console.error("[LOGGING_ERROR] onTextMessageEndEvent", err);
    }
  },
  onRunFailed: ({ error }) => {
    console.error("[COPILOTKIT_ERROR] run_failed", error);
  },
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  onError: ({ error, context }) => {
    console.error(
      "[COPILOTKIT_ERROR]",
      context.request?.operation ?? "unknown",
      error,
    );
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
