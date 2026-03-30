"use client";
import type { RenderParameters } from "@better-captcha/react/provider/t-sec";
import { TSec } from "@better-captcha/react/provider/t-sec";
import { useState } from "react";

export function TSecPlayground({ options }: { options: RenderParameters }) {
  const [response, setResponse] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <TSec
        sitekey="189910271"
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
