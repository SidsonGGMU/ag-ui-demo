"use client";

import { useId } from "react";
import { ToolCallStatus } from "@copilotkit/react-core/v2";

/**
 * In-chat renderer for the sayHello frontend tool: a waving hand
 * while the alert is up, then a springy check mark once it returns.
 */
export function HelloRender({
  args,
  status,
}: {
  name: string;
  toolCallId: string;
  args: Partial<{ name: string }>;
  status: ToolCallStatus;
  result?: string;
}) {
  const done = status === ToolCallStatus.Complete;

  return (
    <div className={`hello-chip${done ? " hello-chip-done" : ""}`}>
      {done ? <CheckIcon /> : <WaveIcon />}
      <span>
        {done
          ? `Hello${args.name ? ` to ${args.name}` : ""} delivered`
          : `Waving hello${args.name ? ` to ${args.name}` : ""}…`}
      </span>
    </div>
  );
}

function WaveIcon() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <style>{`
        @keyframes ${uid}-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(16deg); }
          65% { transform: rotate(-10deg); }
        }
        .${uid}-hand { transform-origin: 12px 20px; animation: ${uid}-wave 1.1s ease-in-out infinite; }
      `}</style>
      <g
        className={`${uid}-hand`}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 11.5V6.8a1.4 1.4 0 0 1 2.8 0v3.4" />
        <path d="M9.8 10.2V5.4a1.4 1.4 0 0 1 2.8 0v4.4" />
        <path d="M12.6 9.8V6.2a1.4 1.4 0 0 1 2.8 0v5" />
        <path d="M15.4 11.2v-2a1.4 1.4 0 0 1 2.8 0v5.4A6.4 6.4 0 0 1 11.8 21h-.4a6.4 6.4 0 0 1-5.6-3.3l-2-3.7a1.4 1.4 0 0 1 2.4-1.4l1 1.6" />
      </g>
    </svg>
  );
}

function CheckIcon() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <style>{`
        @keyframes ${uid}-draw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        @keyframes ${uid}-pop { 0% { transform: scale(0.6); } 70% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .${uid}-ring { transform-origin: 12px 12px; animation: ${uid}-pop .45s cubic-bezier(.34,1.56,.64,1) both; }
        .${uid}-tick { stroke-dasharray: 24; animation: ${uid}-draw .4s ease-out .15s both; }
      `}</style>
      <g className={`${uid}-ring`}>
        <circle cx="12" cy="12" r="10" fill="#3BB273" />
        <path
          className={`${uid}-tick`}
          d="M7.5 12.3 10.6 15.4 16.5 9"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
