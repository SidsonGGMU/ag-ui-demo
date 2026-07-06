"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { HelloTool } from "@/components/HelloTool";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>agui</h1>
      <p>
        Try: &quot;Say hello to me and then give me weather in
        Grenoble&quot;
      </p>
      <HelloTool />
      <CopilotSidebar defaultOpen />
    </main>
  );
}
