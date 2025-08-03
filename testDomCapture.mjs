import { captureDOMMetadata } from './src/domCompare.js';

const url = 'https://example.com';
const outputPath = './test-data/new/dom.json';

await captureDOMMetadata(url, outputPath);
