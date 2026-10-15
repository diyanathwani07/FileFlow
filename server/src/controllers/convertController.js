const path = require('path');
const fs = require('fs');
const { extractText: extractPdfText } = require('unpdf');
const { generateWordDocument } = require('../services/wordService');
const { processScannedPdf } = require('../services/ocrService');

exports.convertPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const originalName = req.file.originalname;
    const forceOcr = req.body.forceOcr === 'true';

    let extractedText = '';
    let totalPages = 1;
    let isScanned = false;

    if (!forceOcr) {
      try {
        const fileBytes = new Uint8Array(fs.readFileSync(pdfPath));
        const pdfData = await extractPdfText(fileBytes);
        const parsedText = Array.isArray(pdfData.text) ? pdfData.text.join('\n\n') : (pdfData.text || '');
        totalPages = pdfData.totalPages || 1;
        
        if (parsedText.trim().length >= 50) {
          console.log('Selectable text found. Extracting directly...');
          extractedText = parsedText;

          // Auto-detect Kruti Dev: if text doesn't contain Devanagari Unicode, convert
          const hasDevanagari = /[\u0900-\u097F]/.test(extractedText);
          if (!hasDevanagari && extractedText.trim().length > 0) {
            console.log('No Devanagari Unicode characters found. Assuming Kruti Dev legacy font and converting...');
            const krutiToUnicode = require('@anthro-ai/krutidev-unicode');
            extractedText = krutiToUnicode(extractedText);
          }
        } else {
          isScanned = true;
        }
      } catch (parseErr) {
        console.warn('Direct text extraction failed, falling back to OCR:', parseErr.message);
        isScanned = true;
      }
    } else {
      isScanned = true;
    }

    if (isScanned) {
      console.log('PDF is scanned or Force OCR is enabled. Running OCR pipeline...');
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
      originalName,
      extractedText
    });

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
