import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface RationCardFormData {
  applicantName: string;
  aadhaar: string;
  mobile: string;
  fatherName: string;
  address: string;
  existingRationCard: string;
  dealerName: string;
  reasonForChange: string;
  familyMembers: {
    name: string;
    fatherName: string;
    gender: string;
    age: string;
    maritalStatus: string;
    relation: string;
  }[];
  photoBase64?: string;
  signatureBase64?: string;
}

export async function generateRationCardPDF(data: RationCardFormData): Promise<string> {
  // Fetch template and font
  const [templateRes, fontRes] = await Promise.all([
    fetch('/assets/ration-form-template.pdf'),
    fetch('/assets/fonts/NotoSansDevanagari-Regular.ttf')
  ]);

  const templateBytes = await templateRes.arrayBuffer();
  const fontBytes = await fontRes.arrayBuffer();

  // Load PDF and Register FontKit
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  // Embed custom font
  const customFont = await pdfDoc.embedFont(fontBytes);
  
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page3 = pages.length > 2 ? pages[2] : pages[0]; // Signature page

  const fontSize = 11;
  const color = rgb(0, 0, 0); // Black

  // Approximate Coordinates (X, Y) from bottom-left
  // These will need to be fine-tuned to match the exact physical form
  
  // 1. Aavedak ka naam
  page1.drawText(data.applicantName || '', { x: 200, y: 685, size: fontSize, font: customFont, color });
  
  // 2. Aadhaar / EID no
  page1.drawText(data.aadhaar || '', { x: 200, y: 655, size: fontSize, font: customFont, color });
  
  // 3. Mobile No
  page1.drawText(data.mobile || '', { x: 200, y: 625, size: fontSize, font: customFont, color });
  
  // 4. Pati / pita ka naam
  page1.drawText(data.fatherName || '', { x: 250, y: 595, size: fontSize, font: customFont, color });
  
  // 5. Purn aawasiya pata (Might need text wrapping logic if it's too long)
  page1.drawText(data.address || '', { x: 200, y: 565, size: fontSize, font: customFont, color });
  
  // 6. Vidyamaan ration card ki sankhya
  page1.drawText(data.existingRationCard || '', { x: 250, y: 535, size: fontSize, font: customFont, color });
  
  // 7. Jan vitaran pranali vikreta
  page1.drawText(data.dealerName || '', { x: 350, y: 505, size: fontSize, font: customFont, color });
  
  // 8. Reason for change checkboxes (Simulating ticks by drawing '✓' or filled box)
  if (data.reasonForChange === 'Nivas') {
    page1.drawText('✓', { x: 200, y: 470, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'JanmMrityu') {
    page1.drawText('✓', { x: 200, y: 445, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'Ashuddhiya') {
    page1.drawText('✓', { x: 250, y: 420, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'Anya') {
    page1.drawText('✓', { x: 150, y: 395, size: 14, font: customFont, color });
  }

  // 9. Family Members Table
  let tableStartY = 310; // Adjust based on template table location
  const rowHeight = 25;
  data.familyMembers.forEach((member, index) => {
    if (index > 4) return; // Limit to prevent overflow, depending on template space
    const y = tableStartY - (index * rowHeight);
    page1.drawText(String(index + 1), { x: 70, y, size: 10, font: customFont, color });
    page1.drawText(member.name || '', { x: 100, y, size: 10, font: customFont, color });
    page1.drawText(member.fatherName || '', { x: 220, y, size: 10, font: customFont, color });
    page1.drawText(member.gender || '', { x: 350, y, size: 10, font: customFont, color });
    page1.drawText(member.age || '', { x: 400, y, size: 10, font: customFont, color });
    page1.drawText(member.maritalStatus || '', { x: 440, y, size: 10, font: customFont, color });
    page1.drawText(member.relation || '', { x: 500, y, size: 10, font: customFont, color });
  });

  // Attach Photo
  if (data.photoBase64) {
    try {
      const base64Data = data.photoBase64.split(',')[1] || data.photoBase64;
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image;
      if (data.photoBase64.includes('image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Draw in photo box area (top right)
      page1.drawImage(image, {
        x: 450,
        y: 650,
        width: 100,
        height: 120,
      });
    } catch (e) {
      console.error("Error embedding photo", e);
    }
  }

  // Attach Signature on Page 3 (or whatever page has the signature box)
  if (data.signatureBase64 && page3) {
    try {
      const base64Data = data.signatureBase64.split(',')[1] || data.signatureBase64;
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image;
      if (data.signatureBase64.includes('image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Draw in signature area (bottom right on declaration page)
      page3.drawImage(image, {
        x: 350,
        y: 100,
        width: 150,
        height: 50,
      });
    } catch (e) {
      console.error("Error embedding signature", e);
    }
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  
  // Create a Blob and return its URL
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
