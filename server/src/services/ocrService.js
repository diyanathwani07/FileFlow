const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');

// Helper to determine if Ghostscript is available is tricky, but pdf2pic will throw an error if it fails
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

let hasNativeTesseract = null;
async function isNativeTesseractAvailable() {
  if (hasNativeTesseract !== null) return hasNativeTesseract;
  try {
    await execPromise('tesseract --version');
    hasNativeTesseract = true;
    console.log('Native system Tesseract detected. Using high-speed low-memory native OCR.');
  } catch {
    hasNativeTesseract = false;
    console.log('Native Tesseract not found. Falling back to tesseract.js.');
  }
  return hasNativeTesseract;
}

exports.processScannedPdf = async (pdfPath) => {
  // Use 150 DPI for optimal OCR accuracy while staying well within Render's 512MB RAM limit
  const options = {
    density: 150,
    saveFilename: "page",
    savePath: path.join(__dirname, '../../uploads/'),
    format: "png"
  };
  
  const convert = fromPath(pdfPath, options);
  let extractedText = '';

  try {
    const results = await convert.bulk(-1, { responseType: "image" });
    console.log(`Successfully converted ${results.length} pages to images.`);

    const nativeOcr = await isNativeTesseractAvailable();

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const imagePath = result.path;
      console.log(`Running OCR on page ${i + 1}/${results.length}...`);
      
      let pageText = '';
      try {
        if (nativeOcr) {
          // Native Linux Tesseract (installed in Docker container): uses < 50MB RAM and runs 5x faster
          const { stdout } = await execPromise(`tesseract "${imagePath}" stdout -l hin+eng --psm 3`);
          pageText = stdout;
        } else {
          // Fallback to tesseract.js WebAssembly
          const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'hin',
            { logger: m => console.log(m.status, Math.round(m.progress * 100) + '%') }
          );
          pageText = text;
        }
      } finally {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      extractedText += pageText.trim() + '\n\n';
    }

    return extractedText;

  } catch (error) {
    console.error("OCR Service Error:", error);
    if (
      (error.message && error.message.includes("gs")) ||
      (error.message && error.message.includes("write EOF")) ||
      (error.message && error.message.includes("EPIPE"))
    ) {
       throw new Error("Ghostscript is required for the Force OCR feature but is not installed on your system. Please download and install Ghostscript (gs) for Windows, then restart the backend server.");
    }
    throw error;
  }
};
