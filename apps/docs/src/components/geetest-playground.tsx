"use client";
import type { RenderParameters } from "@better-captcha/react/provider/geetest";
import { Geetest } from "@better-captcha/react/provider/geetest";
import { useState } from "react";

export function GeetestPlayground() {
  const [options, setOptions] = useState<RenderParameters>({
    language: "eng",
  });
  const [response, setResponse] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Geetest
        sitekey="647f5ed2ed8acb4be36784e01556bb71"
        options={options}
        onSolve={(t) => setResponse(JSON.stringify(t, null, '\t'))}
      />

      {response && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">Response received:</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{response}</p>
        </div>
      )}
    </div>
  );
}
