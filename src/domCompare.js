import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { buildSmartSelector } from './locatorBuilder.js';
import { validateSelectorOnPage } from './selectorValidator.js';
import { ignoreRules } from './ignoreRules.js';
import { cropElementScreenshot } from './cropElementScreenshot.js';

/**
 * Compare DOM metadata between baseline and new versions,
 * and suggest locator updates if there are significant layout shifts or missing elements.
 */
export async function compareDOMs(baselinePath, newPath, reportPath, url) {
  const baseline = await fs.readJson(baselinePath);
  const current = await fs.readJson(newPath);

  const suggestions = [];

  for (const baseEl of baseline) {
    // Skip ignored elements
    const tag = baseEl.tag?.toLowerCase();
    const classes = (baseEl.attributes?.class || '').split(/\s+/);
    const id = baseEl.attributes?.id || '';
    const role = baseEl.attributes?.role || '';

    const isIgnored =
      ignoreRules.tags.includes(tag) ||
      ignoreRules.roles.includes(role) ||
      ignoreRules.classPatterns.some(p => classes.some(cls => p.test(cls))) ||
      ignoreRules.idPatterns.some(p => p.test(id));

    if (isIgnored) {
      console.log(`🔕 Ignoring element: <${tag}> text="${baseEl.text}"`);
      continue;
    }

    // Attempt a fuzzy match by tag and position + text
    const match = current.find(el => {
      const sameTag = el.tag === baseEl.tag;
      const sameText = el.text.trim() === baseEl.text.trim();
      const samePosition =
        Math.abs(el.boundingBox.x - baseEl.boundingBox.x) < 5 &&
        Math.abs(el.boundingBox.y - baseEl.boundingBox.y) < 5;

      const baseId = baseEl.attributes?.id || '';
      const newId = el.attributes?.id || '';
      const idChanged = baseId && baseId !== newId;

      return sameTag && sameText && samePosition && !idChanged;
    });

    if (!match) {
      const healCandidate = current.find(
        el => el.tag === baseEl.tag && el.text.trim() === baseEl.text.trim()
      );

      if (healCandidate) {
        const { selector: suggestedSelector, confidence } = buildSmartSelector(healCandidate);
        const { selector: oldSelector } = buildSmartSelector(baseEl);
        const isValid = await validateSelectorOnPage(url, suggestedSelector);

        const screenshotPath = await cropElementScreenshot(
          url,
          healCandidate.boundingBox,
          suggestions.length + 1,
          './reports/elements'
        );

        console.log('🔍 Healing triggered for:', baseEl.text);
        console.log('➡️ Old Selector:', oldSelector);
        console.log('➡️ Suggested Selector:', suggestedSelector);

        suggestions.push({
          type: 'auto_heal_suggestion',
          message: `Element '${baseEl.text}' (${baseEl.tag}) likely changed selector:`,
          oldSelector,
          suggestedSelector,
          confidenceScore: confidence,
          testSnippets: {
            cypress: `cy.get('${suggestedSelector}')`,
            playwright: `await page.locator('${suggestedSelector}')`,
            jsdom: `document.querySelector('${suggestedSelector}')`
          },
          new: healCandidate,
          isValidSuggestion: isValid,
          screenshotPath: screenshotPath.replace(/^\.\/reports\//, '') // relative for HTML
        });
      } else {
        suggestions.push({
          type: 'missing',
          message: `Element ${baseEl.tag} (${baseEl.text}) is missing in new DOM.`,
          original: baseEl
        });
      }

      continue;
    }

    // Layout shift detection
    const dx = Math.abs(match.boundingBox.x - baseEl.boundingBox.x);
    const dy = Math.abs(match.boundingBox.y - baseEl.boundingBox.y);
    const dw = Math.abs(match.boundingBox.width - baseEl.boundingBox.width);
    const dh = Math.abs(match.boundingBox.height - baseEl.boundingBox.height);

    const shiftThreshold = 10;

    if (dx > shiftThreshold || dy > shiftThreshold || dw > shiftThreshold || dh > shiftThreshold) {
      suggestions.push({
        type: 'layout_shift',
        message: `Element ${buildSmartSelector(baseEl).selector} moved or resized significantly.`,
        original: baseEl,
        new: match
      });
    }
  }

  await fs.outputJson(reportPath, suggestions, { spaces: 2 });
  console.log(chalk.yellow(`📝 Layout analysis completed. Suggestions saved to: ${reportPath}`));
}
