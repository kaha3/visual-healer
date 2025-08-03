const { captureScreenshot } = require('./src/screenshot');

(async () => {
  const url = 'https://example.com';
  const outputPath = './test-data/new/example.png';
  await captureScreenshot(url, outputPath);
})();