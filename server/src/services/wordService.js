const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun } = docx;

exports.generateWordDocument = async (text, originalName) => {
  // Simple structure generation: split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  const docChildren = paragraphs.map(p => {
    return new Paragraph({
      children: [
        new TextRun({
          text: p.trim(),
          font: 'Mangal', // Use a standard Devanagari font
          size: 24, // 12pt
        }),
      ],
      spacing: {
        after: 200,
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
