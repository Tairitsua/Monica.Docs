import { expect, test } from "@playwright/test";

test.describe("documentation shell", () => {
  test("uses one article title and the frontmatter description", async ({ page }) => {
    await page.goto("/docs/getting-started/agent-setup");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".docs-markdown h1")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Agent setup" })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Set up Codex or Claude Code for a Monica repository, preview the changes, and begin development safely.",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Before you start" })).toBeVisible();
  });

  test("renders a migrated document title only from the article shell", async ({ page }) => {
    await page.goto("/docs/getting-started");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Getting started with Monica" })).toBeVisible();
    await expect(page.locator(".docs-markdown h1")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Install the template" })).toBeVisible();
  });

  test("opens the current branch and preserves deliberate group toggles", async ({ page }) => {
    await page.goto("/docs/getting-started/agent-setup");

    const gettingStarted = page.getByRole("button", { name: "Getting started" });
    const concepts = page.getByRole("button", { name: "Concepts" });
    await expect(gettingStarted).toHaveAttribute("aria-expanded", "true");
    await expect(concepts).toHaveAttribute("aria-expanded", "false");

    await concepts.focus();
    await page.keyboard.press("Enter");
    await expect(concepts).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "Architecture" })).toBeVisible();

    await page.getByLabel("Documentation navigation").getByRole("link", { name: "Guide operations and safety" }).click();
    await expect(page).toHaveURL(/\/docs\/getting-started\/guide-operations$/u);
    await expect(page.getByRole("button", { name: "Concepts" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("keeps launch navigation and operations content localized", async ({ page }) => {
    await page.goto("/zh-CN/docs/getting-started/guide-operations");

    await expect(page.getByRole("heading", { level: 1, name: "Guide 运维与安全" })).toBeVisible();
    await expect(page.getByRole("button", { name: "快速开始" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "核心概念" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("heading", { level: 2, name: "三类版本身份" })).toBeVisible();
    await expect(page.getByText("日常 CI 只验证契约与 Revision 记账。", { exact: false })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "了解 Monica Guide 的发布、更新、源码绑定、托管状态、恢复机制与贡献安全边界。",
    );

    await page.getByLabel("文档导航").getByRole("link", { name: "Agent 设置" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Agent 设置" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "开始前" })).toBeVisible();
  });
});
