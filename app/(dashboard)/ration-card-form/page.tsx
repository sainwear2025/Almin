"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateRationCardPDF, RationCardFormData } from "@/lib/pdf/generateRationCard";
import { Download, Eye, FileText, Plus, Trash2, Upload } from "lucide-react";

// Form Schema
const formSchema = z.object({
  applicantName: z.string().min(1, "Name is required"),
  aadhaar: z.string().min(12, "Valid Aadhaar required"),
  mobile: z.string().min(10, "Valid mobile required"),
  fatherName: z.string().min(1, "Father/Husband name is required"),
  address: z.string().min(5, "Full address is required"),
  existingRationCard: z.string().min(1, "Ration card no required"),
  dealerName: z.string().min(1, "Dealer details required"),
  reasonForChange: z.string().min(1, "Select a reason"),
  familyMembers: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      fatherName: z.string().min(1, "Father name required"),
      gender: z.string().min(1, "Required"),
      age: z.string().min(1, "Required"),
      maritalStatus: z.string().min(1, "Required"),
      relation: z.string().min(1, "Required"),
    })
  ),
  photoBase64: z.string().optional(),
  signatureBase64: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RationCardFormPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      familyMembers: [{ name: "", fatherName: "", gender: "", age: "", maritalStatus: "", relation: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "photoBase64" | "signatureBase64") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue(fieldName, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const photoPreview = watch("photoBase64");
  const sigPreview = watch("signatureBase64");

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      const url = await generateRationCardPDF(data);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FileText size={24} className="text-blue-600" />
            Manual Form Filling
          </h1>
          <p className="text-sm mt-1 font-semibold" style={{ color: "var(--brand-primary)" }}>
            Bihar Ration Card Form (Kha)
          </p>
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="Ration_Card_Form.pdf"
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: FORM */}
        <div className="glass-card p-6 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Base Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Applicant Name</label>
                <input {...register("applicantName")} className="form-input w-full" placeholder="आवेदक का नाम" />
                {errors.applicantName && <p className="text-red-500 text-xs mt-1">{errors.applicantName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Aadhaar / EID</label>
                <input {...register("aadhaar")} className="form-input w-full" placeholder="आधार सं०" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Mobile No</label>
                <input {...register("mobile")} className="form-input w-full" placeholder="मोबाईल नं०" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Father/Husband Name</label>
                <input {...register("fatherName")} className="form-input w-full" placeholder="पति/पिता का नाम" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Full Address</label>
                <textarea {...register("address")} className="form-input w-full h-16" placeholder="पूर्ण आवासीय पता" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Existing Ration Card No.</label>
                <input {...register("existingRationCard")} className="form-input w-full" placeholder="विद्यमान राशन कार्ड सं०" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Dealer Name & License</label>
                <input {...register("dealerName")} className="form-input w-full" placeholder="विक्रेता का नाम एवं अनुज्ञप्ति" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Reason for Change</label>
                <select {...register("reasonForChange")} className="form-input w-full">
                  <option value="">Select Reason</option>
                  <option value="Nivas">निवास में परिवर्तन (Change in residence)</option>
                  <option value="JanmMrityu">जन्म या मृत्यु (Birth or death)</option>
                  <option value="Ashuddhiya">कार्ड में वर्णित ब्योरो में अशुद्धियाँ (Errors)</option>
                  <option value="Anya">अन्य कारण (Other)</option>
                </select>
              </div>
            </div>

            {/* Family Members */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold">Family Details</label>
                <button type="button" onClick={() => append({ name: "", fatherName: "", gender: "", age: "", maritalStatus: "", relation: "" })} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                  <Plus size={14} /> Add Member
                </button>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-6 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Name</label>
                      <input {...register(`familyMembers.${index}.name`)} className="form-input w-full text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Father Name</label>
                      <input {...register(`familyMembers.${index}.fatherName`)} className="form-input w-full text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500">Age</label>
                      <input {...register(`familyMembers.${index}.age`)} className="form-input w-full text-xs" />
                    </div>
                    <div className="flex gap-2 items-center">
                       <div className="flex-1">
                         <label className="text-[10px] uppercase font-bold text-gray-500">Rel.</label>
                         <input {...register(`familyMembers.${index}.relation`)} className="form-input w-full text-xs" />
                       </div>
                       <button type="button" onClick={() => remove(index)} className="text-red-500 p-2 hover:bg-red-100 rounded self-end mb-0.5">
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploads */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2">Passport Photo</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden"
                  onClick={() => photoInputRef.current?.click()}
                >
                  {photoPreview ? (
                     <img src={photoPreview} alt="Preview" className="h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Upload size={20} className="mx-auto mb-1" />
                      <span className="text-xs">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={(e) => handleFileUpload(e, "photoBase64")} />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">Signature/Thumb</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden"
                  onClick={() => sigInputRef.current?.click()}
                >
                  {sigPreview ? (
                     <img src={sigPreview} alt="Preview" className="h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Upload size={20} className="mx-auto mb-1" />
                      <span className="text-xs">Upload Signature</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={sigInputRef} onChange={(e) => handleFileUpload(e, "signatureBase64")} />
              </div>
            </div>

            <button type="submit" disabled={isGenerating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {isGenerating ? "Generating..." : <><Eye size={18} /> Preview Form PDF</>}
            </button>
          </form>
        </div>

        {/* RIGHT: PDF PREVIEW */}
        <div className="glass-card p-4 rounded-2xl h-[800px] flex flex-col bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
             Live Preview
          </h2>
          <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-inner">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Fill the form and click Preview to see the PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
