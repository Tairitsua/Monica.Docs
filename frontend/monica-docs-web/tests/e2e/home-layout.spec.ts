import { expect, test, type Page } from "@playwright/test";

type HeroGeometry = {
  copyBottom: number;
  lineRights: number[];
  systemClientWidth: number;
  systemLeft: number;
  systemScrollWidth: number;
  systemTop: number;
  shellWidth: number;
};

async function readHeroGeometry(page: Page): Promise<HeroGeometry> {
  await page.evaluate(() => document.fonts.ready);

  return page.locator(".editorial-hero").evaluate((hero) => {
    const copy = hero.querySelector<HTMLElement>(".hero-copy");
    const system = hero.querySelector<HTMLElement>(".editorial-system");
    const lines = [...hero.querySelectorAll<HTMLElement>(".hero-line")];

    if (!copy || !system || lines.length === 0) {
      throw new Error("Homepage editorial hero geometry is incomplete.");
    }

    const copyBounds = copy.getBoundingClientRect();
    const systemBounds = system.getBoundingClientRect();

    return {
      copyBottom: copyBounds.bottom,
      lineRights: lines.map((line) => {
        const range = document.createRange();
        range.selectNodeContents(line);
        return range.getBoundingClientRect().right;
      }),
      systemClientWidth: system.clientWidth,
      systemLeft: systemBounds.left,
      systemScrollWidth: system.scrollWidth,
      systemTop: systemBounds.top,
      shellWidth: hero.getBoundingClientRect().width,
    };
  });
}

test.describe("editorial homepage layout", () => {
  for (const { locale, path, prefix } of [
    { locale: "English", path: "/", prefix: "" },
    { locale: "Simplified Chinese", path: "/zh-CN", prefix: "/zh-CN" },
  ]) {
    test(`${locale} headline remains clear of the editorial system`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const width of [1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1100 });
        await page.goto(path);

        const geometry = await readHeroGeometry(page);
        expect(geometry.systemTop, `${width}px should use the two-column hero`).toBeLessThan(geometry.copyBottom);
        expect(Math.max(...geometry.lineRights), `${width}px headline overlaps the system`).toBeLessThanOrEqual(geometry.systemLeft);
        expect(geometry.systemScrollWidth, `${width}px system content overflows`).toBeLessThanOrEqual(geometry.systemClientWidth);

        if (width === 1920) {
          expect(geometry.shellWidth).toBe(1280);
        }
      }
    });

    test(`${locale} stacks the editorial system before desktop columns become cramped`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 900, height: 1100 });
      await page.goto(path);

      const geometry = await readHeroGeometry(page);
      expect(geometry.systemTop).toBeGreaterThanOrEqual(geometry.copyBottom);
      expect(geometry.systemScrollWidth).toBeLessThanOrEqual(geometry.systemClientWidth);
    });

    test(`${locale} mobile headlines remain legible without horizontal overflow`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const width of [360, 390, 768]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator("h1")).toHaveCount(1);

        const measurements = await page.locator(".hero-title").evaluate((heading) => {
          const lines = [...heading.querySelectorAll<HTMLElement>(".hero-line")];
          return {
            pageWidth: document.documentElement.clientWidth,
            contentWidth: document.documentElement.scrollWidth,
            lines: lines.map((line) => {
              const style = getComputedStyle(line);
              const range = document.createRange();
              range.selectNodeContents(line);
              return {
                fontSize: parseFloat(style.fontSize),
                lineHeight: parseFloat(style.lineHeight),
                textBounds: [...range.getClientRects()].map((rect) => ({ left: rect.left, right: rect.right })),
              };
            }),
          };
        });

        expect(measurements.contentWidth, `${width}px page has horizontal overflow`).toBeLessThanOrEqual(measurements.pageWidth);
        expect(measurements.lines.length).toBeGreaterThan(0);
        for (const line of measurements.lines) {
          expect(line.lineHeight, `${width}px headline line-height is compressed`).toBeGreaterThanOrEqual(line.fontSize);
          for (const bounds of line.textBounds) {
            expect(bounds.left).toBeGreaterThanOrEqual(0);
            expect(bounds.right).toBeLessThanOrEqual(measurements.pageWidth);
          }
        }
        const geometry = await readHeroGeometry(page);
        expect(geometry.systemTop).toBeGreaterThanOrEqual(geometry.copyBottom);
        expect(geometry.systemScrollWidth).toBeLessThanOrEqual(geometry.systemClientWidth);
      }
    });

    test(`${locale} editorial reading room offers real localized destinations`, async ({ page }) => {
      await page.goto(path);
      const room = page.locator(".editorial-reading-room");
      await expect(room).toBeVisible();
      const links = await room.locator("a").evaluateAll((items) => items.map((item) => item.getAttribute("href")));
      expect(links.length).toBeGreaterThanOrEqual(3);
      expect(links.every((href) => href?.startsWith(`${prefix}/docs/`) || href?.startsWith(`${prefix}/skills`))).toBe(true);
      for (const tile of ["read", "act", "build"]) {
        await expect(page.locator(`.editorial-tile-${tile}`)).toBeVisible();
      }
      await expect(page.locator(".editorial-stats")).toBeVisible();
      await expect(page.locator(".language-toggle")).toHaveAttribute("href", locale === "English" ? "/zh-CN" : "/");
    });
  }
});
