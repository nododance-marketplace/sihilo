import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

test('photography, responsive layout, accessibility and conversion paths', async ({ page }, testInfo) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.url().includes('127.0.0.1') && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => {
    window.__layoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/skydio/i);
  expect(await page.locator('img').evaluateAll(nodes => nodes.map(el => el.alt).join(' '))).not.toMatch(/skydio/i);
  await page.screenshot({ path: `docs/skydio/${testInfo.project.name}-hero.png` });
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
    await expect(image).toHaveAttribute('alt');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  const images = await page.locator('picture img').evaluateAll(nodes => nodes.map(el => ({ src: el.currentSrc, width: el.naturalWidth, renderedWidth: Math.round(el.getBoundingClientRect().width), loading: el.loading })));
  expect(images).toHaveLength(12);
  expect(images.every(i => i.src.includes('/images/skydio/') || i.src.includes('/assets/security/'))).toBeTruthy();
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({ path: `docs/skydio/${testInfo.project.name}-full.png`, fullPage: true });
  await page.locator('#air').screenshot({ path: `docs/skydio/${testInfo.project.name}-air.png` });
  for (const section of ['how', 'coverage', 'intelligence']) {
    await page.locator(`#${section}`).screenshot({ path: `docs/skydio/${testInfo.project.name}-${section}.png` });
  }
  await page.locator('.section--closing').screenshot({ path: `docs/skydio/${testInfo.project.name}-closing.png` });
  await page.locator('#dashboard').screenshot({ path: `docs/new-media/${testInfo.project.name}-dashboard.png` });
  if (testInfo.project.name === 'mobile' || testInfo.project.name === 'small-mobile') {
    await page.evaluate(() => window.scrollTo(0,0));
    await page.locator('#navToggle').click();
    await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded','true');
    await page.locator('#primary-nav a[href="#air"]').click();
    await expect(page.locator('#navToggle')).toHaveAttribute('aria-expanded','false');
  }
  await page.locator('a[data-inquiry]').click();
  await expect(page.locator('#inquiry')).toHaveValue('90-day pilot');
  await page.locator('.form__submit').click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid','true');
  const metrics = await page.evaluate(() => ({ layoutShift: window.__layoutShift, imageBytes: performance.getEntriesByType('resource').filter(r => /\.(avif|webp)/.test(r.name)).reduce((sum,r) => sum+r.encodedBodySize,0) }));
  expect(metrics.layoutShift).toBeLessThan(0.1);
  expect(failures).toEqual([]);
  await expect(page.locator('#heroVideo')).toHaveJSProperty('paused', true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const video = page.locator('#heroVideo');
  await expect(video).toHaveJSProperty('paused', false);
  await expect.poll(() => video.evaluate(el => el.readyState)).toBeGreaterThanOrEqual(2);
  await page.locator('#motionToggle').click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.locator('#motionToggle').click();
  await expect(video).toHaveJSProperty('paused', false);
  const detection = page.locator('#detectionVideo');
  await expect(detection.locator('source')).not.toHaveAttribute('src');
  await detection.scrollIntoViewIfNeeded();
  await expect.poll(() => detection.evaluate(el => el.readyState)).toBeGreaterThanOrEqual(2);
  await expect(detection).toHaveJSProperty('paused', false);
  await expect(detection).toHaveJSProperty('loop', true);
  await expect(detection).toHaveJSProperty('muted', true);
  await page.locator('#detectionToggle').click();
  await expect(detection).toHaveJSProperty('paused', true);
  await page.locator('#detectionToggle').click();
  await expect(detection).toHaveJSProperty('paused', false);
  await page.locator('#motionToggle').click();
  await expect(detection).toHaveJSProperty('paused', true);
  await expect(video).toHaveJSProperty('paused', true);
  expect(failures).toEqual([]);
  await writeFile(`docs/skydio/${testInfo.project.name}-metrics.json`, JSON.stringify({ ...metrics, images, errors: failures, accessibilityViolations: accessibility.violations.length }, null, 2));
});
