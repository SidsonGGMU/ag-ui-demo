"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { log } from "@/lib/logger";
import { HelloRender } from "./tool-render/HelloRender";

/**
 * Registers the `sayHello` frontend tool exactly once (empty deps array).
 * Re-registering on every render is what causes CopilotKit to warn about
 * duplicate tool names and can contribute to repeated/looping tool calls.
 */
export function HelloTool() {
  useFrontendTool(
    {
      name: "sayHello",
      description:
        "Shows a one-time 'Hello' alert in the user's browser. " +
        "Call this AT MOST ONCE per user request. It always returns a " +
        "success result immediately - never call it again after it has " +
        "returned status='success'.",
      parameters: z.object({
        name: z
          .string()
          .optional()
          .describe("Optional name to greet, e.g. 'Sidson'."),
      }),
      // Ensures the agent automatically continues the run (e.g. on to
      // getWeather) once this tool's result is delivered, instead of the
      // conversation stalling after the frontend side effect.
      followUp: true,
      handler: async ({ name }) => {
        log("AGENT_TOOL_CALL", `sayHello name=${name ?? "(none)"}`);

        setTimeout(
          () => {
            const result = {
              status: "success",
              completed: true,
              tool: "sayHello",
              message:
                "The hello alert was shown to the user. Do not call sayHello again for this request.",
            };

            log(
              "FRONTEND_TOOL_RESULT",
              `sayHello success completed=${result.completed}`,
            );

            return result;
          },
          5000
        )
      },
      render: HelloRender,
    },
    [],
  );

  return null;
}
