import fs from 'fs-extra';
import puppeteer from 'puppeteer';

/**
 * Crops a screenshot of the element at given bounding box from a live URL.
 */
export async function cropElementScreenshot(url, boundingBox, index, outputDir) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Ensure the directory exists
  await fs.ensureDir(outputDir);

  const screenshotPath = `${outputDir}/element-${index}.png`;

  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: Math.round(boundingBox.x),
      y: Math.round(boundingBox.y),
      width: Math.round(boundingBox.width),
      height: Math.round(boundingBox.height)
    }
  });

  await browser.close();
  return screenshotPath;
}
