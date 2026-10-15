const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');

// Helper to determine if Ghostscript is available is tricky, but pdf2pic will throw an error if it fails
exports.processScannedPdf = async (pdfPath) => {
  // Set up pdf2pic options
  const options = {
    density: 300,           // High density for better OCR
    saveFilename: "page",
    savePath: path.join(__dirname, '../../uploads/'),
    format: "png",
    width: 2480,
    height: 3508
  };
  
  const convert = fromPath(pdfPath, options);
  
  let extractedText = '';

  try {
    // Bulk convert all pages. Note: For very large PDFs, this should be done page by page or streamed.
    const results = await convert.bulk(-1, true); // -1 means all pages
    console.log(`Successfully converted ${results.length} pages to images.`);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      // image info is in result.path or result.buffer if we used stream
      const imagePath = result.path;
      
      console.log(`Running OCR on page ${i + 1}...`);
      
      // Run Tesseract on the image
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'hin', // Hindi language model
        { logger: m => console.log(m.status, Math.round(m.progress * 100) + '%') }
      );
      
      extractedText += text + '\n\n';
      
      // Cleanup image
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
