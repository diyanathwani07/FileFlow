const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun } = docx;

exports.generateWordDocument = async (text, originalName) => {
  // Split by single newlines to preserve exact line formatting
  const lines = text.split('\n');
  
  const docChildren = lines.map(line => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          font: 'Mangal', // Use a standard Devanagari font
          size: 24, // 12pt
        }),
      ],
      spacing: {
        after: line.trim() === '' ? 240 : 0, // Add paragraph spacing ONLY for blank lines
      }
    });
  });

  const doc = new Document({
    creator: "Hindi PDF to Word Converter",
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const b64string = await Packer.toBuffer(doc);
  const outputFileName = originalName.replace('.pdf', '') + '-' + Date.now() + '.docx';
  const outputPath = path.join(__dirname, '../../output/', outputFileName);
  
  // Ensure output dir exists
  if (!fs.existsSync(path.join(__dirname, '../../output/'))) {
    fs.mkdirSync(path.join(__dirname, '../../output/'), { recursive: true });
  }

  fs.writeFileSync(outputPath, b64string);
  return outputPath;
};
