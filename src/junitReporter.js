import fs from 'fs-extra';
import { create } from 'xmlbuilder2';

export async function generateJUnitReport(suggestionsPath, outputPath) {
  const suggestions = await fs.readJson(suggestionsPath);

  const root = create({ version: '1.0' }).ele('testsuites');
  const suite = root.ele('testsuite', {
    name: 'Visual Test Auto-Healer',
    tests: suggestions.length,
    failures: suggestions.length
  });

  suggestions.forEach((s, i) => {
    const tc = suite.ele('testcase', {
      name: `${s.type} - ${s.message}`,
      classname: 'visual-healer'
    });
    //console.log(`🧪 Adding failure message:`, s.message);
    tc.ele('failure').txt(s.message);
  });

  const xml = root.end({ prettyPrint: true });
  await fs.outputFile(outputPath, xml);
  console.log(`🧪 JUnit XML saved to: ${outputPath}`);
}
