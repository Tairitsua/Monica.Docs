import { expect, test } from "@playwright/test";

test.describe("documentation shell", () => {
  test("uses one article title and the frontmatter description", async ({ page }) => {
    await page.goto("/docs/getting-started/agent-setup");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".docs-markdown h1")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Agent setup" })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Install Monica Guide and choose the skills for an application, extension, or framework workspace.",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Start with the release installer" })).toBeVisible();
  });

  test("renders a migrated document title only from the article shell", async ({ page }) => {
    await page.goto("/docs/getting-started");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Getting started with Monica" })).toBeVisible();
    await expect(page.locator(".docs-markdown h1")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Install", exact: true })).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Host-bound module composition", exact: true })).toBeVisible();

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
    await expect(page.getByRole("heading", { level: 2, name: "检查状态" })).toBeVisible();
    await expect(page.getByText("源码绑定只用于查找，不改变项目依赖，也不授权编辑。", { exact: false })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "管理 Monica Skill 安装、精确发布版本、框架源码查找与工作区状态。",
    );

    await page.getByLabel("文档导航").getByRole("link", { name: "Agent 设置" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Agent 设置" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "从发布版安装" })).toBeVisible();
  });
});
