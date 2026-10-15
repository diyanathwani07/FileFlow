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

  // Method 1: Use pdftoppm (High-speed Linux native tool, converts in ~1 sec with 150 DPI)
  try {
    console.log('Converting PDF to images with pdftoppm...');
    await execPromise(`pdftoppm -png -r 150 "${pdfPath}" "${outputPrefix}"`, { timeout: 30000 });
    
    // Find all generated images
    const allFiles = fs.readdirSync(uploadDir);
    imageFiles = allFiles
      .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
      .sort()
      .map(f => path.join(uploadDir, f));
    console.log(`pdftoppm generated ${imageFiles.length} pages.`);
  } catch (err) {
    console.warn('pdftoppm not available or failed, falling back to pdf2pic:', err.message);
  }

  // Method 2: Fallback to pdf2pic (if pdftoppm is not on system)
  if (imageFiles.length === 0) {
    try {
      const { fromPath } = require('pdf2pic');
      const options = {
        density: 150,
        saveFilename: prefix,
        savePath: uploadDir,
        format: "png"
      };
      const convert = fromPath(pdfPath, options);
      const results = await convert.bulk(-1, { responseType: "image" });
      imageFiles = results.map(r => r.path);
      console.log(`pdf2pic generated ${imageFiles.length} pages.`);
    } catch (err) {
      console.error('pdf2pic conversion failed:', err.message);
      throw new Error(`Failed to render PDF to images: ${err.message}`);
    }
  }

  if (imageFiles.length === 0) {
    throw new Error('No page images were generated from the PDF.');
  }

  let extractedText = '';

  for (let i = 0; i < imageFiles.length; i++) {
    const imgPath = imageFiles[i];
    console.log(`Running OCR on page ${i + 1}/${imageFiles.length}...`);
    let pageText = '';

    try {
      // Try native Tesseract CLI (installed in Docker, uses <50MB RAM and runs in ~2 sec)
      try {
        const { stdout } = await execPromise(`tesseract "${imgPath}" stdout -l hin+eng --psm 3`, { timeout: 30000 });
        pageText = stdout;
      } catch (nativeErr) {
        // Try hin only if hin+eng failed
        try {
          const { stdout } = await execPromise(`tesseract "${imgPath}" stdout -l hin --psm 3`, { timeout: 30000 });
          pageText = stdout;
        } catch {
          // If native tesseract failed, fallback to tesseract.js
          const Tesseract = require('tesseract.js');
          const { data: { text } } = await Tesseract.recognize(imgPath, 'hin');
          pageText = text;
        }
      }
    } finally {
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    if (pageText && pageText.trim()) {
      extractedText += pageText.trim() + '\n\n';
    }
  }

  return extractedText;
};
