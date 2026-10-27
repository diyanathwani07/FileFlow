const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

exports.processScannedPdf = async (pdfPath) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const prefix = `ocr-${Date.now()}`;
  const outputPrefix = path.join(uploadDir, prefix);
  let imageFiles = [];

  // Step 1: Render PDF pages at 96 DPI (extremely fast, low memory, finishes in < 1s)
  try {
    console.log('Rendering PDF pages at 96 DPI with pdftoppm...');
    await execPromise(`pdftoppm -png -r 96 "${pdfPath}" "${outputPrefix}"`, { timeout: 15000 });
    
    const allFiles = fs.readdirSync(uploadDir);
    imageFiles = allFiles
      .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
      .sort()
      .map(f => path.join(uploadDir, f));
    console.log(`pdftoppm rendered ${imageFiles.length} page(s).`);
  } catch (err) {
    console.warn('pdftoppm failed or not installed, trying pdf2pic...', err.message);
  }

  // Fallback to pdf2pic if pdftoppm wasn't found (e.g. local dev)
  if (imageFiles.length === 0) {
    try {
      const { fromPath } = require('pdf2pic');
      const options = {
        density: 96,
        saveFilename: prefix,
        savePath: uploadDir,
        format: "png"
      };
      const convert = fromPath(pdfPath, options);
      const results = await convert.bulk(-1, { responseType: "image" });
      imageFiles = results.map(r => r.path);
    } catch (err) {
      console.error('Image rendering failed:', err.message);
      throw new Error(`Failed to render PDF pages: ${err.message}`);
    }
  }

  if (imageFiles.length === 0) {
    throw new Error('No page images were generated from the PDF.');
  }

  // Limit processing to max 10 pages per request to stay safely within cloud limits
  const pagesToProcess = imageFiles.slice(0, 10);
  let extractedText = '';

  // Step 2: Batch OCR all pages in a single Tesseract invocation
  // Passing an image list file enables Tesseract to load neural net weights once
  const listFile = path.join(uploadDir, `${prefix}-pages.txt`);
  fs.writeFileSync(listFile, pagesToProcess.join('\n'));

  try {
    console.log(`Running fast native OCR on ${pagesToProcess.length} page(s)...`);
    const ocrCmd = `tesseract "${listFile}" stdout -l hin+eng --dpi 96 --oem 1 --psm 3 -c tessedit_do_invert=0`;
    const { stdout } = await execPromise(ocrCmd, { timeout: 45000 });
    extractedText = stdout;
  } catch (batchErr) {
    console.warn('Batch OCR with hin+eng failed, trying hin only:', batchErr.message);
    try {
      const { stdout } = await execPromise(`tesseract "${listFile}" stdout -l hin --dpi 96 --oem 1 --psm 3 -c tessedit_do_invert=0`, { timeout: 45000 });
      extractedText = stdout;
    } catch (hinErr) {
      console.warn('Batch OCR failed, falling back to page-by-page:', hinErr.message);
      // Page by page fallback
      for (const img of pagesToProcess) {
        try {
          const { stdout } = await execPromise(`tesseract "${img}" stdout -l hin --dpi 96 --psm 3 -c tessedit_do_invert=0`, { timeout: 15000 });
          extractedText += stdout + '\n\n';
        } catch (e) {
          console.error('Page OCR error:', e.message);
        }
      }
    }
  } finally {
    // Clean up list file and all images
    if (fs.existsSync(listFile)) {
      try { fs.unlinkSync(listFile); } catch {}
    }
    for (const img of imageFiles) {
      if (fs.existsSync(img)) {
        try { fs.unlinkSync(img); } catch {}
      }
    }
  }

  return extractedText.trim();
};
