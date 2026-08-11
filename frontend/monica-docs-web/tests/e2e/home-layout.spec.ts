import { expect, test, type Page } from "@playwright/test";

type HeroGeometry = {
  copyBottom: number;
  lineRights: number[];
  modelClientWidth: number;
  modelLeft: number;
  modelScrollWidth: number;
  modelTop: number;
  shellWidth: number;
};

async function readHeroGeometry(page: Page): Promise<HeroGeometry> {
  await page.evaluate(() => document.fonts.ready);

  return page.locator(".hero").evaluate((hero) => {
    const copy = hero.querySelector<HTMLElement>(".hero-copy");
    const model = hero.querySelector<HTMLElement>(".hero-model");
    const lines = [...hero.querySelectorAll<HTMLElement>(".hero-line")];

    if (!copy || !model || lines.length === 0) {
      throw new Error("Homepage hero geometry is incomplete.");
    }

    const copyBounds = copy.getBoundingClientRect();
    const modelBounds = model.getBoundingClientRect();
    const lineRights = lines.map((line) => {
      const range = document.createRange();
      range.selectNodeContents(line);
      return range.getBoundingClientRect().right;
    });

    return {
      copyBottom: copyBounds.bottom,
      lineRights,
      modelClientWidth: model.clientWidth,
      modelLeft: modelBounds.left,
      modelScrollWidth: model.scrollWidth,
      modelTop: modelBounds.top,
      shellWidth: hero.getBoundingClientRect().width,
    };
  });
}

test.describe("homepage hero layout", () => {
  for (const { locale, path } of [
    { locale: "English", path: "/" },
    { locale: "Simplified Chinese", path: "/zh-CN" },
  ]) {
    test(`${locale} headline remains clear of the application model`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const width of [1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1100 });
        await page.goto(path);

        const geometry = await readHeroGeometry(page);
        expect(geometry.modelTop, `${width}px should use the two-column hero`).toBeLessThan(geometry.copyBottom);
        expect(Math.max(...geometry.lineRights), `${width}px headline overlaps the model`).toBeLessThanOrEqual(geometry.modelLeft);
        expect(geometry.modelScrollWidth, `${width}px model content overflows`).toBeLessThanOrEqual(geometry.modelClientWidth);

        if (width === 1920) {
          expect(geometry.shellWidth).toBe(1600);
        }
      }
    });
  }

  test("stacks the application model before the desktop columns become cramped", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1279, height: 1100 });
    await page.goto("/");

    const geometry = await readHeroGeometry(page);
    expect(geometry.modelTop).toBeGreaterThanOrEqual(geometry.copyBottom);
    expect(geometry.modelScrollWidth).toBeLessThanOrEqual(geometry.modelClientWidth);
  });
});
