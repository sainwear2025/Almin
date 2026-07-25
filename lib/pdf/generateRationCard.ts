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
  const page2 = pages.length > 1 ? pages[1] : pages[0];
  const page3 = pages.length > 2 ? pages[2] : pages[0];

  const fontSize = 11;
  const color = rgb(0.1, 0.1, 0.1);

  // --- PAGE 1: BASIC DETAILS ---
  // Coordinates are from bottom-left (0,0)
  
  page1.drawText(data.applicantName || '', { x: 200, y: 605, size: fontSize, font: customFont, color });
  page1.drawText(data.aadhaar || '', { x: 200, y: 575, size: fontSize, font: customFont, color });
  page1.drawText(data.mobile || '', { x: 200, y: 545, size: fontSize, font: customFont, color });
  page1.drawText(data.fatherName || '', { x: 230, y: 515, size: fontSize, font: customFont, color });
  page1.drawText(data.address || '', { x: 200, y: 485, size: fontSize, font: customFont, color });
  page1.drawText(data.existingRationCard || '', { x: 240, y: 455, size: fontSize, font: customFont, color });
  page1.drawText(data.dealerName || '', { x: 360, y: 425, size: fontSize, font: customFont, color });
  
  // Checkboxes for reason
  const tick = '✓';
  if (data.reasonForChange === 'Nivas') {
    page1.drawText(tick, { x: 180, y: 365, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'JanmMrityu') {
    page1.drawText(tick, { x: 180, y: 335, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'Ashuddhiya') {
    page1.drawText(tick, { x: 230, y: 305, size: 14, font: customFont, color });
  } else if (data.reasonForChange === 'Anya') {
    page1.drawText(tick, { x: 150, y: 275, size: 14, font: customFont, color });
  }

  // Attach Photo on Page 1 (Top Right)
  if (data.photoBase64) {
    try {
      const base64Data = data.photoBase64.split(',')[1] || data.photoBase64;
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image = data.photoBase64.includes('image/png') 
        ? await pdfDoc.embedPng(imageBytes) 
        : await pdfDoc.embedJpg(imageBytes);
      
      page1.drawImage(image, {
        x: 430,
        y: 540,
        width: 100,
        height: 120,
      });
    } catch (e) {
      console.error("Error embedding photo", e);
    }
  }

  // --- PAGE 1 & 2: FAMILY MEMBERS TABLE ---
  const rowHeight = 22;
  
  data.familyMembers.forEach((member, index) => {
    let currentPage;
    let startY;
    let localIndex;
    
    // First 3 members on Page 1, rest on Page 2
    if (index < 3) {
      currentPage = page1;
      startY = 195;
      localIndex = index;
    } else {
      currentPage = page2;
      startY = 720; // Adjust for top of table on page 2
      localIndex = index - 3;
    }
    
    if (localIndex > 3 && currentPage === page2) return; // Max 4 on page 2

    const y = startY - (localIndex * rowHeight);
    currentPage.drawText(String(index + 1), { x: 75, y, size: 10, font: customFont, color });
    currentPage.drawText(member.name || '', { x: 115, y, size: 10, font: customFont, color });
    currentPage.drawText(member.fatherName || '', { x: 220, y, size: 10, font: customFont, color });
    currentPage.drawText(member.gender || '', { x: 340, y, size: 10, font: customFont, color });
    currentPage.drawText(member.age || '', { x: 395, y, size: 10, font: customFont, color });
    currentPage.drawText(member.maritalStatus || '', { x: 445, y, size: 10, font: customFont, color });
    currentPage.drawText(member.relation || '', { x: 510, y, size: 10, font: customFont, color });
  });

  // --- PAGE 3: SIGNATURE ---
  if (data.signatureBase64 && page3) {
    try {
      const base64Data = data.signatureBase64.split(',')[1] || data.signatureBase64;
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      let image = data.signatureBase64.includes('image/png') 
        ? await pdfDoc.embedPng(imageBytes) 
        : await pdfDoc.embedJpg(imageBytes);
      
      page3.drawImage(image, {
        x: 400,
        y: 440,
        width: 120,
        height: 40,
      });
    } catch (e) {
      console.error("Error embedding signature", e);
    }
  }

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a Blob and return its URL
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
