import puppeteer from 'puppeteer';
import { launchBrowser } from './puppeteerLaunch.js';

/**
 * Validates that the suggested selector matches an element on the given page.
 * @param {string} url - The page URL to load.
 * @param {string} selector - The CSS selector to test.
 * @returns {Promise<boolean>} - Whether the selector matched at least one element.
 */
export async function validateSelectorOnPage(url, selector) {
  try {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    const isValid = await page.evaluate((sel) => {
      try {
        return !!document.querySelector(sel);
      } catch (e) {
        return false;
      }
    }, selector);

    await browser.close();
    return isValid;
  } catch (err) {
    console.error(`⚠️ Error validating selector "${selector}":`, err.message);
    return false;
  }
}
