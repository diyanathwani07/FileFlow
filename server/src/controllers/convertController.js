const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { generateWordDocument } = require('../services/wordService');
const { processScannedPdf } = require('../services/ocrService');
// Trigger nodemon restart

exports.convertPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const originalName = req.file.originalname;

    // 1. Analyze PDF using pdf-parse to check for selectable text
    const dataBuffer = fs.readFileSync(pdfPath);
    const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.PDFParse || pdfParse.default);
    const pdfData = await parseFunc(dataBuffer);

    let extractedText = '';
    const textLength = pdfData.text ? pdfData.text.trim().length : 0;
    
    // Threshold to determine if it's a scanned PDF (e.g., less than 50 chars might just be metadata/watermarks)
    const isScanned = textLength < 50;

    let totalPages = pdfData.numpages;

    if (!isScanned) {
      // It has selectable text
      console.log('Selectable text found. Extracting directly...');
      extractedText = pdfData.text;
    } else {
      // It's a scanned PDF, need OCR
      console.log('No selectable text found. PDF appears to be scanned. Starting OCR process...');
      
      // Check if Ghostscript is available for OCR service
      // We will handle this inside processScannedPdf
      extractedText = await processScannedPdf(pdfPath);
    }

    if (!extractedText || extractedText.trim() === '') {
       throw new Error('Failed to extract text from the PDF. The resulting text was empty.');
    }

    // 2. Generate Word Document
    console.log('Generating Word document...');
    const docxPath = await generateWordDocument(extractedText, originalName);

    // 3. Clean up the uploaded PDF file
    fs.unlinkSync(pdfPath);

    // 4. Send response
    res.json({
      success: true,
      message: 'Conversion completed successfully',
      isScanned,
      pagesProcessed: totalPages,
      downloadUrl: `/api/download/${path.basename(docxPath)}`,
      originalName
    });

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
