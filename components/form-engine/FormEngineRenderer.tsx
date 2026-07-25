import React from 'react';
import { FormConfig, FormField, FormTable } from '@/lib/form-engine/types';

interface Props {
  config: FormConfig;
  data: any;
}

const resolveDataPath = (data: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], data);
};

const evaluateCondition = (data: any, condition: any): boolean => {
  if (!condition) return true;
  const value = resolveDataPath(data, condition.field);
  switch (condition.operator) {
    case 'equals': return value === condition.value;
    case 'notEquals': return value !== condition.value;
    case 'contains': return value && String(value).includes(condition.value);
    default: return true;
  }
};

export const FormEngineRenderer: React.FC<Props> = ({ config, data }) => {
  return (
    <div className="bg-gray-100 flex flex-col items-center gap-4 py-8" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
      {config.pages.map((page) => {
        // Filter fields for this page
        const pageFields = config.fields.filter(f => f.page === page.pageNumber);
        
        return (
          <div 
            key={page.pageNumber} 
            className="relative bg-white shadow-xl overflow-hidden" 
            style={{ 
              width: config.pageSize === 'A4' ? '210mm' : '8.5in',
              height: config.pageSize === 'A4' ? '297mm' : '11in',
              pageBreakAfter: 'always'
            }}
            id={`form-page-${page.pageNumber}`}
          >
            {/* Background Template */}
            <img 
              src={page.backgroundImage} 
              alt={`Page ${page.pageNumber}`} 
              className="absolute inset-0 w-full h-full z-0 object-cover pointer-events-none"
            />
            
            {/* Render Fields */}
            {pageFields.map(field => {
              // Check visibility condition
              if (field.condition && !evaluateCondition(data, field.condition)) return null;

              const value = resolveDataPath(data, field.id);
              let renderContent: React.ReactNode = null;

              if (field.type === 'text') {
                renderContent = value;
              } else if (field.type === 'checkbox') {
                 // For booleans
                 const isTrue = !!value;
                 renderContent = isTrue ? (field.trueValue || '✓') : (field.falseValue || '');
              } else if (field.type === 'image') {
                 if (value) {
                   renderContent = <img src={value} className="w-full h-full object-contain" alt="" />;
                 }
              } else if (field.type === 'conditionalText') {
                 const isTrue = !!value;
                 renderContent = isTrue ? (field.trueValue || value) : (field.falseValue || '');
              }

              if (!renderContent) return null;

              return (
                <div 
                  key={field.id}
                  style={{
                    position: 'absolute',
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                    fontSize: field.fontSize || '11pt',
                    fontWeight: field.fontWeight || 'normal',
                    color: field.color || '#000',
                    textAlign: field.textAlign || 'left',
                    zIndex: 10,
                  }}
                >
                  {renderContent}
                </div>
              );
            })}

            {/* Render Tables */}
            {config.tables && config.tables.map(table => {
              // Find the span rule for THIS page
              const span = table.pageSpans.find(s => s.page === page.pageNumber);
              if (!span) return null;

              // Calculate which rows belong to this page
              // We need to count total capacity on preceding pages
              let precedingCapacity = 0;
              for (const s of table.pageSpans) {
                if (s.page < page.pageNumber) {
                  precedingCapacity += s.maxRows;
                }
              }

              const tableData = data[table.id] || [];
              
              // Extract the rows for this specific page
              const pageRows = tableData.slice(precedingCapacity, precedingCapacity + span.maxRows);

              return (
                <div key={table.id} style={{ position: 'absolute', left: 0, top: span.startY, width: '100%', zIndex: 10 }}>
                  {pageRows.map((row: any, rowIndex: number) => {
                    const yOffset = `calc(${rowIndex} * ${span.rowHeight})`;
                    return (
                      <div key={rowIndex} style={{ position: 'absolute', top: yOffset, left: 0, width: '100%', height: span.rowHeight }}>
                        {table.columns.map(col => (
                          <div 
                            key={col.key}
                            style={{
                              position: 'absolute',
                              left: col.x,
                              width: col.width,
                              fontSize: table.fontSize || '11pt',
                              textAlign: col.textAlign || 'left',
                            }}
                          >
                            {col.key === '_index' ? (precedingCapacity + rowIndex + 1) : resolveDataPath(row, col.key)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>
        );
      })}
    </div>
  );
};
