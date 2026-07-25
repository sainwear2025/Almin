import { FormConfig } from '@/lib/form-engine/types';

export const biharRationKhaConfig: FormConfig = {
  formId: 'bihar-ration-kha',
  name: 'Bihar Ration Card Prapatra Kha',
  pageSize: 'A4',
  orientation: 'portrait',
  pages: [
    {
      pageNumber: 1,
      backgroundImage: '/assets/forms/ration-page-1.jpg' // We will need to convert the user's PDF/images to these paths
    },
    {
      pageNumber: 2,
      backgroundImage: '/assets/forms/ration-page-2.jpg'
    },
    {
      pageNumber: 3,
      backgroundImage: '/assets/forms/ration-page-3.jpg'
    }
  ],
  fields: [
    // PAGE 1 Basic Details
    { id: 'applicantName', type: 'text', page: 1, x: '55mm', y: '73mm', fontSize: '11pt' },
    { id: 'aadhaar', type: 'text', page: 1, x: '55mm', y: '84mm', fontSize: '11pt' },
    { id: 'mobile', type: 'text', page: 1, x: '55mm', y: '95mm', fontSize: '11pt' },
    { id: 'fatherName', type: 'text', page: 1, x: '70mm', y: '106mm', fontSize: '11pt' },
    { id: 'address', type: 'text', page: 1, x: '55mm', y: '117mm', fontSize: '11pt' },
    { id: 'existingRationCard', type: 'text', page: 1, x: '75mm', y: '128mm', fontSize: '11pt' },
    { id: 'dealerName', type: 'text', page: 1, x: '110mm', y: '139mm', fontSize: '11pt' },
    
    // Photo
    { id: 'photoBase64', type: 'image', page: 1, x: '150mm', y: '60mm', width: '35mm', height: '45mm' },

    // Reason checkboxes
    { id: 'reasonForChange', type: 'conditionalText', page: 1, x: '50mm', y: '161mm', condition: { field: 'reasonForChange', operator: 'equals', value: 'Nivas' }, trueValue: '✓' },
    { id: 'reasonForChange', type: 'conditionalText', page: 1, x: '50mm', y: '172mm', condition: { field: 'reasonForChange', operator: 'equals', value: 'JanmMrityu' }, trueValue: '✓' },
    { id: 'reasonForChange', type: 'conditionalText', page: 1, x: '70mm', y: '183mm', condition: { field: 'reasonForChange', operator: 'equals', value: 'Ashuddhiya' }, trueValue: '✓' },
    { id: 'reasonForChange', type: 'conditionalText', page: 1, x: '40mm', y: '194mm', condition: { field: 'reasonForChange', operator: 'equals', value: 'Anya' }, trueValue: '✓' },

    // PAGE 2 Rural Declarations (approximate coordinates, will need tuning if user uploads actual A4 jpegs)
    { id: 'ruralDeclarations.motorVehicle', type: 'checkbox', page: 2, x: '110mm', y: '120mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.machineEquip', type: 'checkbox', page: 2, x: '120mm', y: '128mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.govtRegIndustry', type: 'checkbox', page: 2, x: '140mm', y: '136mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.incomeOver10k', type: 'checkbox', page: 2, x: '150mm', y: '144mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.incomeTax', type: 'checkbox', page: 2, x: '70mm', y: '152mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.commercialTax', type: 'checkbox', page: 2, x: '95mm', y: '160mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.puccaHouse3Rooms', type: 'checkbox', page: 2, x: '90mm', y: '175mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.irrigatedLand2_5', type: 'checkbox', page: 2, x: '50mm', y: '190mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.irrigatedLand5', type: 'checkbox', page: 2, x: '50mm', y: '205mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.irrigatedLand7_5', type: 'checkbox', page: 2, x: '75mm', y: '220mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.govtServant', type: 'checkbox', page: 2, x: '150mm', y: '235mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    
    // Rural Govt Servant details
    { id: 'ruralDeclarations.govtServantDetails.serviceName', type: 'text', page: 2, x: '50mm', y: '243mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.govtServantDetails.postingPlace', type: 'text', page: 2, x: '50mm', y: '251mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },
    { id: 'ruralDeclarations.govtServantDetails.monthlyIncome', type: 'text', page: 2, x: '60mm', y: '259mm', condition: { field: 'areaType', operator: 'equals', value: 'Rural' } },

    // Urban Declarations
    { id: 'urbanDeclarations.incomeTax', type: 'checkbox', page: 2, x: '95mm', y: '280mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.govtServant', type: 'checkbox', page: 2, x: '150mm', y: '288mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.govtServantDetails.serviceName', type: 'text', page: 3, x: '50mm', y: '25mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.govtServantDetails.postingPlace', type: 'text', page: 3, x: '50mm', y: '33mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.govtServantDetails.monthlyIncome', type: 'text', page: 3, x: '60mm', y: '41mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    
    { id: 'urbanDeclarations.commercialTax', type: 'checkbox', page: 3, x: '105mm', y: '49mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.puccaHouse3Rooms', type: 'checkbox', page: 3, x: '70mm', y: '64mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.incomeOver20k', type: 'checkbox', page: 3, x: '150mm', y: '72mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.threeAppliances', type: 'checkbox', page: 3, x: '140mm', y: '80mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.fourWheeler', type: 'checkbox', page: 3, x: '105mm', y: '88mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },
    { id: 'urbanDeclarations.washingMachine', type: 'checkbox', page: 3, x: '105mm', y: '96mm', condition: { field: 'areaType', operator: 'equals', value: 'Urban' } },

    // Date & Place
    { id: 'date', type: 'text', page: 3, x: '35mm', y: '135mm' },
    { id: 'place', type: 'text', page: 3, x: '35mm', y: '143mm' },
    
    // Signatures
    { id: 'signatureBase64', type: 'image', page: 3, x: '120mm', y: '130mm', width: '40mm', height: '15mm' },
    { id: 'applicantName', type: 'text', page: 3, x: '120mm', y: '150mm', textAlign: 'center', width: '40mm' },
    
    // Second Signatures block at bottom
    { id: 'date', type: 'text', page: 3, x: '35mm', y: '190mm' },
    { id: 'place', type: 'text', page: 3, x: '35mm', y: '198mm' },
    { id: 'signatureBase64', type: 'image', page: 3, x: '120mm', y: '185mm', width: '40mm', height: '15mm' },
    { id: 'applicantName', type: 'text', page: 3, x: '120mm', y: '205mm', textAlign: 'center', width: '40mm' },
  ],
  tables: [
    {
      id: 'familyMembers',
      fontSize: '10pt',
      columns: [
        { key: '_index', x: '20mm', width: '10mm', textAlign: 'center' },
        { key: 'name', x: '35mm', width: '35mm' },
        { key: 'fatherName', x: '75mm', width: '35mm' },
        { key: 'gender', x: '115mm', width: '15mm' },
        { key: 'age', x: '135mm', width: '10mm', textAlign: 'center' },
        { key: 'maritalStatus', x: '150mm', width: '20mm' },
        { key: 'relation', x: '175mm', width: '20mm' },
        // Cols 8-12 which only show on Page 2 based on span
        { key: 'aadhaar', x: '30mm', width: '40mm' },
        { key: 'mobile', x: '90mm', width: '25mm' },
        { key: 'occupation', x: '120mm', width: '25mm' },
        { key: 'incomeSource', x: '150mm', width: '20mm' },
        { key: 'monthlyIncome', x: '175mm', width: '20mm' }
      ],
      pageSpans: [
        { page: 1, startY: '230mm', rowHeight: '8mm', maxRows: 5 },
        { page: 2, startY: '45mm', rowHeight: '8mm', maxRows: 5 }
      ]
    }
  ]
};
