import { compareDOMs } from './src/domCompare.js';

const baselinePath = './test-data/baseline/dom.json';
const newPath = './test-data/new/dom.json';
const reportPath = './reports/dom-suggestions.json';

await compareDOMs(baselinePath, newPath, reportPath);
