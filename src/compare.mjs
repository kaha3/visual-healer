import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import path from 'path';

/**
 * Compare two screenshots and generate a visual diff.
 * @param {string} baselinePath
 * @param {string} newPath
 * @param {string} diffPath
 */
export async function compareScreenshots(baselinePath, newPath, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
  const img2 = PNG.sync.read(fs.readFileSync(newPath));

  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error('Image dimensions do not match');
  }

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  console.log(`🖼️ Diff saved to: ${diffPath}`);
  console.log(`❗ Pixel differences: ${diffPixels}`);
  return diffPixels;
}

