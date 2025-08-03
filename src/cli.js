#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { captureScreenshot } from './screenshot.js';
import { captureDOMMetadata } from './domCapture.js';
import { compareScreenshots } from './compare.mjs';
import { compareDOMs } from './domCompare.js';
import { generateMarkdownReport, generateHtmlReport } from './reportGenerator.js';
import { generateJUnitReport } from './junitReporter.js';

const program = new Command();

program
  .name('Visual Test Auto-Healer')
  .description('Detects layout shifts and auto-heals locators!')
  .version('0.1.0');

program
  .command('analyze')
  .argument('<url>', 'URL to analyze')
  .option('--label <label>', 'Label for this run (default: new)', 'new')
  .option('--ci', 'Enable CI mode and fail if issues are found')
  .option('--fail-on <type>', 'Fail only on specific issue types (e.g. healing, layout-shift, invalid-selector)')
  .action(async (url, options) => {
    const label = options.label;
    const baselineLabel = 'baseline';

    // Paths
    const screenshotPath = `./test-data/${label}/example.png`;
    const domPath = `./test-data/${label}/dom.json`;
    const baselineScreenshotPath = `./test-data/${baselineLabel}/example.png`;
    const baselineDomPath = `./test-data/${baselineLabel}/dom.json`;
    const reportJsonPath = './reports/dom-suggestions.json';
    const markdownPath = './reports/report.md';
    const htmlPath = './reports/report.html';

    // 1. Capture screenshot & DOM
    await captureScreenshot(url, screenshotPath);
    await captureDOMMetadata(url, domPath);

    // 2. Compare screenshots
    if (await fs.pathExists(baselineScreenshotPath)) {
      await compareScreenshots(baselineScreenshotPath, screenshotPath, './reports/diff.png');
    } else {
      console.log(chalk.yellow(`No baseline screenshot found. Skipping visual diff.`));
    }

    // 3. Compare DOM + validate selectors
    if (await fs.pathExists(baselineDomPath)) {
      await compareDOMs(baselineDomPath, domPath, reportJsonPath, url);
      await generateMarkdownReport(reportJsonPath, markdownPath);
      await generateHtmlReport(reportJsonPath, htmlPath);
      await generateJUnitReport(reportJsonPath, './reports/junit-report.xml');
    } else {
      console.log(chalk.yellow(`No baseline DOM found. Skipping DOM diff.`));
    }

    // 4. Helpful tip
    console.log(chalk.cyan(`\nTip: To set a new baseline, copy files from './test-data/new/' to './test-data/baseline/' after you review changes.`));

    // 5. CI mode exit handling
    if (options.ci) {
      const suggestions = await fs.readJson(reportJsonPath);
      let filteredIssues = suggestions;

      if (options.failOn) {
        const failType = options.failOn.toLowerCase();

        filteredIssues = suggestions.filter(s => {
          if (failType === 'healing') return s.type === 'auto_heal_suggestion';
          if (failType === 'layout-shift') return s.type === 'layout_shift';
          if (failType === 'invalid-selector') return s.type === 'auto_heal_suggestion' && s.isValidSuggestion === false;
          return false;
        });
      }

      if (filteredIssues.length > 0) {
        console.log(chalk.red(`\n❌ CI Mode: ${filteredIssues.length} '${options.failOn || 'any'}' issue(s) detected. Failing the build.`));
        process.exit(1);
      } else {
        console.log(chalk.green(`\n✅ CI Mode: No '${options.failOn || 'layout'}' issues found. Build passes.`));
      }
    }
  });

program.parse(process.argv);
