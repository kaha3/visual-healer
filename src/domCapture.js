import puppeteer from 'puppeteer';
import fs from 'fs-extra';

/**
 * Extracts clickable/input elements and saves their bounding boxes and attributes.
 */
export async function captureDOMMetadata(url, outputPath) {
  console.log(`🧠 Capturing DOM metadata from: ${url}`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  const domData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [data-testid], [role]'));

    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      const attrs = {};
      for (const { name, value } of Array.from(el.attributes)) {
        if (name.startsWith('data-') || ['id', 'name', 'class', 'role'].includes(name)) {
          attrs[name] = value;
        }
      }

      return {
        tag: el.tagName,
        text: el.innerText || el.value || '',
        attributes: attrs,
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      };
    });
  });

  await fs.outputJson(outputPath, domData, { spaces: 2 });
  await browser.close();
  console.log(`📄 DOM metadata saved to: ${outputPath}`);
}
