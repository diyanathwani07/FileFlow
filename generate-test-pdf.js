const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test-hindi.pdf'));

// Note: standard fonts in PDFKit don't support Hindi natively,
// but for a quick selectable text test, we'll try to embed a font or just output raw unicode text that pdf-parse can still extract.
// Wait, pdfkit requires a unicode font to render Hindi correctly.
// I will just use English for a structural test if a Hindi font isn't easily available,
// but the user wants Hindi. I'll just write simple Hindi text. It might render as garbage visually without a font, but the underlying text will be Hindi Unicode, and pdf-parse should extract it.

doc.text('नमस्ते दुनिया! यह एक परीक्षण पीडीएफ है।');
doc.end();
