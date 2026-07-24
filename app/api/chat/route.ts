import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    // Fetch contextual data for the AI
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      pendingServicesCount,
      todayCustomersCount,
      totalCustomers,
      allInvoices,
      allServices,
      allInventory
    ] = await Promise.all([
      prisma.service.count({ where: { status: { in: ["PENDING", "SUBMITTED", "PROCESSING"] } } }),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.customer.count(),
      prisma.invoice.findMany({ select: { total: true, createdAt: true, paymentStatus: true } }),
      prisma.service.findMany({ select: { fees: true, createdAt: true, paymentStatus: true } }),
      prisma.inventoryItem.findMany({ select: { quantity: true, minStock: true } })
    ]);

    // Calculate Sales (Invoices + Services)
    let todaySales = 0;
    let lifetimeSales = 0;
    let todayInvoices = 0;
    
    allInvoices.forEach(inv => {
      lifetimeSales += inv.total;
      if (inv.createdAt >= today) {
        todaySales += inv.total;
        todayInvoices++;
      }
    });
    
    allServices.forEach(srv => {
      lifetimeSales += srv.fees || 0;
      if (srv.createdAt >= today) {
        todaySales += srv.fees || 0;
      }
    });

    const lifetimeInvoices = allInvoices.length;
    const lowStockCount = allInventory.filter(item => item.quantity <= item.minStock).length;

    const systemPrompt = `You are a helpful AI assistant for "Almin General Store", a digital service point shop. 
You act as the Shop Manager and answer questions about the shop's sales, stock, and business data accurately.
Always reply in a helpful, concise, and friendly manner. If asked in Hindi/Hinglish, reply in Hinglish.

Here is the current REAL-TIME data from the shop's database (use this to answer user's questions):
- Total Lifetime Sales Revenue: ₹${lifetimeSales}
- Today's Sales Revenue: ₹${todaySales}
- Total Invoices Generated: ${lifetimeInvoices}
- Today's Invoices Generated: ${todayInvoices}
- Total Customers: ${totalCustomers} (Today: ${todayCustomersCount})
- Pending/Active Online Services: ${pendingServicesCount}
- Low Stock Items (Quantity <= Min Stock): ${lowStockCount} items need restocking.

CRITICAL INSTRUCTIONS FOR REPORTS AND PDFS:
If the user asks for a "PDF", "Sales Report", "Report", or asks to download/view the data in a document:
- Do NOT say you cannot generate a PDF. 
- Tell them: "Aap yahan se report ka PDF download kar sakte hain: [Download PDF Report](/reports)"
If the user asks to see the low stock items or inventory:
- Tell them: "Aap yahan stock check kar sakte hain: [View Inventory](/inventory)"
If the user asks to see pending services:
- Tell them: "Aap yahan pending services dekh sakte hain: [View Services](/services)"

Use markdown links formatted as [Link Text](/path) so they can click it.`;

    // Convert OpenAI style messages to Gemini style
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      role: "assistant",
      content: response.text,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response: " + error.message },
      { status: 500 }
    );
  }
}
