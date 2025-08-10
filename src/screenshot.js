import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

export async function captureScreenshot(url, outputPath) {
  console.log(`📸 Capturing screenshot of: ${url}`);

  // CI-safe launch args (only applied in CI)
  const args = ['--disable-dev-shm-usage', '--disable-gpu'];
  if (process.env.CI) {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  const browser = await puppeteer.launch({
    headless: 'new',   // works well with Puppeteer 24+
    args,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  await fs.ensureDir(path.dirname(outputPath));
  await page.screenshot({ path: outputPath, fullPage: true });

  await browser.close();
  console.log(`✅ Screenshot saved to: ${outputPath}`);
}
