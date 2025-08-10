// src/puppeteerLaunch.js
import puppeteer from 'puppeteer';

export function launchBrowser() {
  const args = ['--disable-dev-shm-usage', '--disable-gpu'];
  if (process.env.CI) {
    args.push('--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote');
  }
  return puppeteer.launch({
    headless: 'new', // or true if you prefer
    args,
  });
}