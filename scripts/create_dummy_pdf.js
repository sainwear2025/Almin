import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function createDummy() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage();
  pdfDoc.addPage();
  pdfDoc.addPage();
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/assets/ration-form-template.pdf', pdfBytes);
}

createDummy();
