"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { monicaRelease } from "@/lib/monica-release";

const CSHARP_CODE = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.ProjectName = "Orders";
        options.AppName = "Orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
        options.EnableMinimalApiByDefault = true;
    });

    monica.AddOpenTelemetry()
        .UsePrometheusEndpoint();
});

var app = builder.Build();
app.UseMonica();
app.MapGet("/", () => "Monica is running.");
app.MapHealthChecks("/healthz");
app.MapMonica();
app.Run();`;

type StarterCodeProps = {
  copyLabel: string;
  copiedLabel: string;
};

export function StarterCode({ copyLabel, copiedLabel }: StarterCodeProps) {
  const [activeTab, setActiveTab] = useState<"cli" | "csharp">("cli");
  const [copied, setCopied] = useState(false);
  const cliCode = `dotnet new install ${monicaRelease.templatePackage}
dotnet new monica-api -n Orders
cd Orders && dotnet run`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeTab === "cli" ? cliCode : CSHARP_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const selectByKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setActiveTab((current) => current === "cli" ? "csharp" : "cli");
    const targetId = activeTab === "cli" ? "code-tab-csharp" : "code-tab-cli";
    document.getElementById(targetId)?.focus();
  };

  return (
    <div className="code-window">
      <div className="code-toolbar">
        <div className="code-tabs" role="tablist" aria-label="Starter code">
          <button
            className={`code-tab${activeTab === "cli" ? " is-active" : ""}`}
            id="code-tab-cli"
            role="tab"
            aria-selected={activeTab === "cli"}
            aria-controls="code-panel-cli"
            tabIndex={activeTab === "cli" ? 0 : -1}
            onClick={() => setActiveTab("cli")}
            onKeyDown={selectByKey}
          >
            CLI
          </button>
          <button
            className={`code-tab${activeTab === "csharp" ? " is-active" : ""}`}
            id="code-tab-csharp"
            role="tab"
            aria-selected={activeTab === "csharp"}
            aria-controls="code-panel-csharp"
            tabIndex={activeTab === "csharp" ? 0 : -1}
            onClick={() => setActiveTab("csharp")}
            onKeyDown={selectByKey}
          >
            Program.cs
          </button>
        </div>
        <button className="copy-button" type="button" onClick={copyCode}>
          {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>

      <div className={`code-panel${activeTab === "cli" ? " is-active" : ""}`} id="code-panel-cli" role="tabpanel" aria-labelledby="code-tab-cli" hidden={activeTab !== "cli"}>
        <pre><code><span className="code-comment"># Install the template</span>{"\n"}<span className="code-prompt">$</span> dotnet new install {monicaRelease.templatePackage}{"\n\n"}<span className="code-comment"># Create a modular API</span>{"\n"}<span className="code-prompt">$</span> dotnet new monica-api -n Orders{"\n"}<span className="code-prompt">$</span> cd Orders &amp;&amp; dotnet run{"\n\n"}<span className="code-output">✓ Monica is running</span>{"\n"}<span className="code-output">→ /healthz</span>{"\n"}<span className="code-output">→ /metrics</span></code></pre>
      </div>

      <div className={`code-panel${activeTab === "csharp" ? " is-active" : ""}`} id="code-panel-csharp" role="tabpanel" aria-labelledby="code-tab-csharp" hidden={activeTab !== "csharp"}>
        <pre><code>{CSHARP_CODE}</code></pre>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ""}</span>
    </div>
  );
}
