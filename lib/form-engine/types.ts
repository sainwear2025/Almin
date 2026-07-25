export type FieldType = 'text' | 'checkbox' | 'image' | 'conditionalText';

export interface FormCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains';
  value: any;
}

export interface FormField {
  id: string; // matches the key in the formData JSON
  type: FieldType;
  page: number; // 1-indexed
  x: string; // e.g. "45mm"
  y: string; // e.g. "62mm"
  width?: string;
  height?: string;
  fontSize?: string; // default: "11pt"
  fontFamily?: string;
  fontWeight?: string;
  color?: string; // default: "black"
  textAlign?: 'left' | 'center' | 'right';
  condition?: FormCondition; // Render only if condition is met
  format?: 'date' | 'uppercase'; // specific formatting
  trueValue?: string; // for checkboxes, what to render if true (e.g. "✓")
  falseValue?: string; // for checkboxes, what to render if false
}

export interface TableColumn {
  key: string;
  x: string; // x offset relative to the table start or absolute page x
  width?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface TablePageSpan {
  page: number;
  startY: string; // e.g. "120mm"
  rowHeight: string; // e.g. "8mm"
  maxRows: number;
}

export interface FormTable {
  id: string; // corresponds to array in formData
  columns: TableColumn[];
  pageSpans: TablePageSpan[]; // Determines how the table splits across pages
  fontSize?: string;
}

export interface FormPage {
  pageNumber: number;
  backgroundImage: string; // path to the template image
}

export interface FormConfig {
  formId: string;
  name: string;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  pages: FormPage[];
  fields: FormField[];
  tables?: FormTable[];
}
