import fs from 'fs-extra';

export async function generateMarkdownReport(suggestionsPath, outputPath) {
  const suggestions = await fs.readJson(suggestionsPath);

  let md = `# Visual Test Auto-Healer Report

${suggestions.length === 0 ? "✅ No layout issues detected!" : `## Issues Detected: ${suggestions.length}\n`}`;

  for (const [i, s] of suggestions.entries()) {
    md += `\n### ${i + 1}. ${s.type.replace('_', ' ').toUpperCase()}\n`;
    md += `- **Message:** ${s.message}\n`;
    if (s.oldSelector) md += `- **Old Selector:** \`${s.oldSelector}\`\n`;
    if (s.suggestedSelector) md += `- **Suggested Selector:** \`${s.suggestedSelector}\`\n`;
    if (s.confidenceScore !== undefined) {
      md += `- **Confidence Score:** ${s.confidenceScore}%\n`;
    }
    if (s.testSnippets) {
  md += `- **Test Snippets:**\n`;
  md += `  - Cypress: \`${s.testSnippets.cypress}\`\n`;
  md += `  - Playwright: \`${s.testSnippets.playwright}\`\n`;
  md += `  - JS DOM: \`${s.testSnippets.jsdom}\`\n`;
}

    if (s.isValidSuggestion !== undefined) {
      md += `- **Valid Selector Match:** ${s.isValidSuggestion ? "✅ Yes" : "❌ No"}\n`;
    }
    if (s.original) {
      md += `- **Original Element:** \`${s.original.tag}\` — "${s.original.text}"\n`;
      md += `- **Original Bounding Box:** ${JSON.stringify(s.original.boundingBox)}\n`;
    }
    if (s.new) {
      md += `- **New Element:** \`${s.new.tag}\` — "${s.new.text}"\n`;
      md += `- **New Bounding Box:** ${JSON.stringify(s.new.boundingBox)}\n`;
    }
  }

  await fs.outputFile(outputPath, md);
  console.log(`📄 Markdown report saved to: ${outputPath}`);
}

export async function generateHtmlReport(suggestionsPath, outputPath) {
  const suggestions = await fs.readJson(suggestionsPath);

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visual Test Auto-Healer Report</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 0; }
    .container { max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 0 12px #aaa; padding: 36px; }
    h1 { color: #2c3e50; }
    h2 { color: #7c4dff; }
    .issue { border-bottom: 1px solid #e0e0e0; padding: 18px 0; }
    .type { display: inline-block; background: #7c4dff; color: #fff; border-radius: 6px; padding: 2px 10px; font-size: 13px; margin-bottom: 6px; }
    .code { font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
    .diff-img { margin: 24px 0; display: block; max-width: 100%; border: 2px solid #eee; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Test Auto-Healer Report</h1>
    <h2>${suggestions.length === 0 ? "✅ No layout issues detected!" : `Issues Detected: ${suggestions.length}`}</h2>
    ${suggestions.map((s, i) => `
      <div class="issue">
        <span class="type">${s.type.replace('_', ' ').toUpperCase()}</span>
        <div><b>Message:</b> ${s.message}</div>
        ${s.oldSelector ? `<div><b>Old Selector:</b> <span class="code">${s.oldSelector}</span></div>` : ""}
        ${s.suggestedSelector ? `<div><b>Suggested Selector:</b> <span class="code">${s.suggestedSelector}</span></div>` : ""}
        ${s.confidenceScore !== undefined ? `<div><b>Confidence Score:</b> ${s.confidenceScore}%</div>` : ""}
        ${s.testSnippets ? `
  <div><b>Test Snippets:</b>
    <ul>
      <li>Cypress: <code>${s.testSnippets.cypress}</code></li>
      <li>Playwright: <code>${s.testSnippets.playwright}</code></li>
      <li>JS DOM: <code>${s.testSnippets.jsdom}</code></li>
    </ul>
  </div>` : ""}

        ${s.isValidSuggestion !== undefined ? `<div><b>Valid Selector Match:</b> ${s.isValidSuggestion ? '✅ Yes' : '❌ No'}</div>` : ""}
        ${s.original ? `<div><b>Original Element:</b> <span class="code">${s.original.tag}</span> — "${s.original.text}"</div>
        <div><b>Original Bounding Box:</b> <span class="code">${JSON.stringify(s.original.boundingBox)}</span></div>` : ""}
        ${s.new ? `<div><b>New Element:</b> <span class="code">${s.new.tag}</span> — "${s.new.text}"</div>
        <div><b>New Bounding Box:</b> <span class="code">${JSON.stringify(s.new.boundingBox)}</span></div>` : ""}
        ${s.screenshotPath ? `<div><b>Element Screenshot:</b><br><img src="${s.screenshotPath}" style="max-width: 100%; border: 1px solid #ccc; border-radius: 6px;" /></div>` : ""}
      </div>
    `).join('')}
    <h2>Visual Diff</h2>
    <img src="./diff.png" class="diff-img" alt="Visual Diff"/>
  </div>
</body>
</html>
`;

  await fs.outputFile(outputPath, html);
  console.log(`🌐 HTML report saved to: ${outputPath}`);
}
