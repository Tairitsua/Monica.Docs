import { expect, test } from "@playwright/test";

test("installs one universal Guide before asking for a repository or profile", async ({ page }) => {
  await page.goto("/");

  const agentMode = page.getByRole("tab", { name: "Agent setup" });
  await expect(agentMode).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Before you start", { exact: true })).toBeVisible();
  await expect(page.getByText("Paste the copied instruction into agent chat—not into a terminal.")).toBeVisible();
  await expect(page.getByText("You do not need a repository yet.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Monica Guide instruction" })).toHaveCount(1);
  await expect(page.locator(".starter-next-steps")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy request" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Codex" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Claude Code" })).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByLabel("Release-verified hosts").getByRole("listitem")).toHaveText([
    "Codex",
    "Claude Code",
  ]);
  await expect(page.getByText("Bind exact Monica framework source for read-only lookup")).toBeVisible();

  const fullPrompt = page.locator("details.full-prompt-details");
  await expect(fullPrompt).not.toHaveAttribute("open", "");
  await fullPrompt.getByText("View the full instruction", { exact: true }).click();
  await expect(fullPrompt).toContainText("$monica-guide init --workspace");
  await expect(fullPrompt).toContainText("$monica-guide configure --workspace");
  await expect(fullPrompt).toContainText("{rid}");
  await expect(fullPrompt).toContainText("SHA256SUMS");
  await expect(fullPrompt).not.toContainText("Monica.Docs");
  await expect(fullPrompt).not.toContainText("--apply");
  await expect(fullPrompt).not.toContainText("--agent");
  await expect(fullPrompt).not.toContainText("--profile application");
  await expect(fullPrompt).not.toContainText("npx");
  await expect(fullPrompt).not.toContainText("Monica.Guide.exe");

  const fallback = page.locator("details.generic-fallback");
  await expect(fallback).not.toHaveAttribute("open", "");
  await fallback.getByText("Manual terminal fallback", { exact: true }).click();
  await expect(fallback).toContainText("$monica-guide configure --workspace <workspace>");
  await expect(fallback).toContainText("$monica-guide status --workspace <workspace>");
  await expect(fallback).not.toContainText("-a codex");
  await expect(fallback).not.toContainText("npx");
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

  await page.getByRole("button", { name: "Copy Monica Guide instruction" }).click();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard");
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("monica-guide");
  expect(clipboard).toContain("From this immutable release");
  expect(clipboard).toContain("$monica-guide init --workspace");
  expect(clipboard).toContain("{rid}");
  expect(clipboard).toContain("SHA256SUMS");
  expect(clipboard).not.toContain("--apply");
  expect(clipboard).not.toContain("--agent");
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

  await page.getByRole("button", { name: "Copy Monica Guide instruction" }).click();
  const alert = page.locator(".copy-fallback");
  await expect(alert).toContainText("Clipboard access failed");
  const fallback = alert.getByRole("textbox", { name: "Select and copy this instruction manually" });
  await expect(fallback).toBeFocused();
  await expect(fallback).toHaveValue(/monica-guide/u);
  await expect(fallback).not.toHaveValue(/--profile application/u);
  const selection = await fallback.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    return [textarea.selectionStart, textarea.selectionEnd, textarea.value.length];
  });
  expect(selection).toEqual([0, selection[2], selection[2]]);
});

test("keeps bilingual Guide onboarding and fallback documentation aligned", async ({ page }) => {
  await page.goto("/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent setup", level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Start with the release installer", level: 2 })).toBeVisible();
  await expect(page.getByText("Monica.Docs is an ordinary documentation repository and has no Guide-specific docs profile or source binding.", { exact: false })).toBeVisible();

  await page.goto("/zh-CN");
  await expect(page.getByRole("tab", { name: "Agent 设置" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "复制 Monica Guide 指令" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByText("绑定精确版本的 Monica 框架源码，用于只读查找")).toBeVisible();
  await expect(page.getByRole("link", { name: "打开完整快速开始" })).toHaveAttribute("href", "/zh-CN/docs/getting-started/agent-setup");

  await page.goto("/zh-CN/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent 设置", level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "从发布版安装", level: 2 })).toBeVisible();
});

test("uses seven editorial and product sections and remains contained with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(7);
  await expect(page.getByRole("link", { name: "Start with Monica" })).toHaveAttribute("href", "#start");
  await expect(page.locator(".editorial-tile-build")).toHaveAttribute("href", "#example");
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
