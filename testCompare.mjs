import { compareScreenshots } from './src/compare.mjs';

const baseline = './test-data/baseline/example.png';
const latest = './test-data/new/example.png';
const diff = './reports/diff.png';

try {
  const diffPixels = await compareScreenshots(baseline, latest, diff);
  console.log(`Total different pixels: ${diffPixels}`);
} catch (error) {
  console.error('Comparison failed:', error.message);
}
