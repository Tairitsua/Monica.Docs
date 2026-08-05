import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const catalog = JSON.parse(
  readFileSync(resolve(process.cwd(), "../../../MoLibrary/.monica/agent-skill-catalog.json"), "utf8"),
) as { distribution: { skillsCli: { package: string; version: string } } };
const cliReference = `${catalog.distribution.skillsCli.package}@${catalog.distribution.skillsCli.version} add`;

test("offers Codex, Claude Code, generic, and manual setup paths", async ({ page }) => {
  await page.goto("/");

  const agentMode = page.getByRole("tab", { name: "Agent setup" });
  await expect(agentMode).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Codex" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Codex" })).toContainText(cliReference);
  await expect(page.getByRole("tabpanel", { name: "Codex" })).toContainText("--release-tag");

  await page.getByRole("tab", { name: "Claude Code" }).click();
  await expect(page.getByRole("tabpanel", { name: "Claude Code" })).toContainText("claude-code");

  const fallback = page.locator("details.generic-fallback");
  await expect(fallback).not.toHaveAttribute("open", "");
  await fallback.getByText("Generic npx skills fallback").click();
  await expect(fallback).toHaveAttribute("open", "");
  await expect(fallback).toContainText("-a codex -a claude-code");

  await page.getByRole("tab", { name: "Manual .NET" }).click();
  await expect(page.getByRole("tab", { name: "CLI", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "CLI", exact: true })).toContainText("dotnet new monica-api");

  await page.getByRole("tab", { name: "Program.cs" }).click();
  await expect(page.getByRole("tabpanel", { name: "Program.cs" })).toContainText("builder.AddMonica");
  await expect(page.getByRole("link", { name: "Open the full quick start" })).toHaveAttribute("href", "/docs/getting-started/agent-setup");
});

test("supports keyboard tab navigation and clipboard feedback", async ({ context, page }) => {
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
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.locator(".code-window .sr-only")).toHaveText("Copied to clipboard");
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("monica-guide");
  expect(clipboard).not.toContain("{{MONICA_IMMUTABLE_REF}}");
});

test("keeps the bilingual guide available when the documentation API is unavailable", async ({ page }) => {
  await page.goto("/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent setup", level: 1 })).toBeVisible();
  await expect(page.getByText("LOCAL PREVIEW", { exact: true })).toBeVisible();

  await page.goto("/zh-CN");
  await expect(page.getByRole("tab", { name: "Agent 设置" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Codex" })).toContainText("全局安装具名 monica-guide Skill");
  await expect(page.getByRole("link", { name: "打开完整快速开始" })).toHaveAttribute("href", "/zh-CN/docs/getting-started/agent-setup");

  await page.goto("/zh-CN/docs/getting-started/agent-setup");
  await expect(page.getByRole("heading", { name: "Agent 设置", level: 1 })).toBeVisible();
});

test("contains the starter at desktop and mobile widths and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expect(page.locator(".hero-reveal").first()).toHaveCSS("opacity", "1");
  const reducedTransformIsIdentity = await page.locator(".hero-reveal").first().evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" || new DOMMatrix(transform).isIdentity;
  });
  expect(reducedTransformIsIdentity).toBe(true);

  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const bounds = await page.locator(".code-window").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? 0).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
  }
});
