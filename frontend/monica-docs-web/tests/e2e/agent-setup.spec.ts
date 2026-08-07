import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const catalog = JSON.parse(
  readFileSync(resolve(process.cwd(), "../../../MoLibrary/.monica/agent-skill-catalog.json"), "utf8"),
) as { distribution: { skillsCli: { package: string; version: string } } };
const cliReference = `${catalog.distribution.skillsCli.package}@${catalog.distribution.skillsCli.version} add`;

test("guides Codex and Claude Code users by goal without exposing the full prompt first", async ({ page }) => {
  await page.goto("/");

  const agentMode = page.getByRole("tab", { name: "Agent setup" });
  await expect(agentMode).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Before you start", { exact: true })).toBeVisible();
  await expect(page.getByText("Paste the copied instruction into agent chat—not into a terminal.")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Codex" })).toHaveAttribute("aria-selected", "true");

  const applicationGoal = page.getByRole("radio", { name: /A Monica application/u });
  await expect(applicationGoal).toBeChecked();
  await expect(page.getByRole("button", { name: "Copy application setup instruction" })).toBeVisible();
  const fullPrompt = page.locator("details.full-prompt-details").filter({ hasText: "View the full instruction" }).first();
  await expect(fullPrompt).not.toHaveAttribute("open", "");
  await fullPrompt.getByText("View the full instruction", { exact: true }).click();
  await expect(fullPrompt).toContainText(cliReference);
  await expect(fullPrompt).toContainText("--profile application");
  await expect(fullPrompt).toContainText("--release-tag");
  await expect(fullPrompt).toContainText("releaseCatalogDigest");
  await expect(fullPrompt).not.toContainText("--apply");

  await page.getByRole("radio", { name: /A Monica extension/u }).check();
  await expect(page.getByRole("button", { name: "Copy extension setup instruction" })).toBeVisible();
  await expect(fullPrompt).toContainText("--profile extension-author");
  await expect(page.getByRole("tabpanel", { name: "Codex" }).getByText("Exact read-only Monica source is required")).toBeVisible();

  await page.getByRole("tab", { name: "Claude Code" }).click();
  const claudePanel = page.getByRole("tabpanel", { name: "Claude Code" });
  await expect(claudePanel).toContainText("Claude Code");
  const claudePrompt = claudePanel.locator("details.full-prompt-details");
  await claudePrompt.getByText("View the full instruction", { exact: true }).click();
  await expect(claudePrompt).toContainText("--agent claude-code");

  const fallback = claudePanel.locator("details.generic-fallback");
  await expect(fallback).not.toHaveAttribute("open", "");
  await fallback.getByText("Generic npx skills fallback", { exact: true }).click();
  await expect(fallback).toContainText("--agent codex --agent claude-code");
  await expect(fallback).toContainText("--profile extension-author");
});

test("keeps Manual .NET as a complete first-class path", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Manual .NET" }).click();
  await expect(page.getByRole("tab", { name: "CLI", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "CLI", exact: true })).toContainText("dotnet new monica-api");

  await page.getByRole("tab", { name: "Program.cs" }).click();
  await expect(page.getByRole("tabpanel", { name: "Program.cs" })).toContainText("builder.AddMonica");
  await expect(page.getByRole("link", { name: "Open the full quick start" })).toHaveAttribute("href", "/docs/getting-started/agent-setup");
});

test("supports keyboard tab navigation and successful clipboard feedback", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  const agentMode = page.getByRole("tab", { name: "Agent setup" });
  await agentMode.focus();
  await agentMode.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Manual .NET" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Manual .NET" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Manual .NET" }).press("Home");
  await expect(agentMode).toBeFocused();

  const codex = page.getByRole("tab", { name: "Codex" });
  await codex.focus();
  await codex.press("End");
  await expect(page.getByRole("tab", { name: "Claude Code" })).toBeFocused();

  await page.getByRole("tab", { name: "Codex" }).click();
  await page.getByRole("button", { name: "Copy application setup instruction" }).click();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard");
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("monica-guide");
  expect(clipboard).toContain("--profile application");
  expect(clipboard).not.toContain("{{MONICA_IMMUTABLE_REF}}");
  expect(clipboard).not.toContain("{{MONICA_CATALOG_DIGEST}}");
});

test("makes clipboard failure recoverable without losing the instruction", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("clipboard denied"); } },
    });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Copy application setup instruction" }).click();
  const alert = page.locator(".copy-fallback");
  await expect(alert).toContainText("Clipboard access failed");
  const fallback = alert.getByRole("textbox", { name: "Select and copy this instruction manually" });
  await expect(fallback).toBeFocused();
  await expect(fallback).toHaveValue(/--profile application/u);
  const selection = await fallback.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    return [textarea.selectionStart, textarea.selectionEnd, textarea.value.length];
  });
  expect(selection).toEqual([0, selection[2], selection[2]]);
});

test("keeps bilingual Guide onboarding and fallback documentation aligned", async ({ page }) => {
  await page.goto("/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent setup", level: 1 })).toHaveCount(1);

  await page.goto("/zh-CN");
  await expect(page.getByRole("tab", { name: "Agent 设置" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("radio", { name: /Monica 应用/u })).toBeChecked();
  await page.getByRole("radio", { name: /Monica 扩展/u }).check();
  await expect(page.getByRole("button", { name: "复制扩展设置指令" })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开完整快速开始" })).toHaveAttribute("href", "/zh-CN/docs/getting-started/agent-setup");

  await page.goto("/zh-CN/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent 设置", level: 1 })).toHaveCount(1);
});

test("uses six primary sections and remains contained with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "Start with Monica" })).toHaveAttribute("href", "#start");
  await expect(page.getByRole("link", { name: "Explore the order example" })).toHaveAttribute("href", "/reference");
  await expect(page.getByLabel("Illustrative order request flow")).toBeVisible();
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expect(page.locator(".hero-reveal").first()).toHaveCSS("opacity", "1");

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const bounds = await page.locator(".code-window").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? 0).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
  }
});
