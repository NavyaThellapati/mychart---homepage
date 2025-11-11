import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Ensure this is correctly imported

interface PaymentHistory {
  id: string;
  date: string;
  invoice: string;
  department: string;
  amount: number;
  status: "Pending" | "Paid";
}

interface Bill {
  id: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue";
}

function formatDateTime(dt: string) {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function downloadPaymentBill(
  payment: PaymentHistory,
  currentUser?: { firstName?: string; lastName?: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Add font for better character support (optional, but good practice)
  doc.setFont("helvetica", "normal");

  // Add font for better character support (optional, but good practice)
  doc.setFont("helvetica", "normal");

  // Header with MyChart branding
  doc.setFillColor(30, 136, 229);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MyChart", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Receipt", 20, 33);

  yPos = 50;

  // Patient Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (currentUser?.firstName && currentUser?.lastName) {
    doc.text(`Patient: ${currentUser.firstName} ${currentUser.lastName}`, 20, yPos);
    yPos += 7;
  }
  
  doc.text(`Receipt Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 15;

  // Invoice Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 42, 74);
  doc.text("Invoice Details", 20, yPos);
  yPos += 12;

  // Invoice details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  doc.text(`Invoice Number: ${payment.invoice}`, 20, yPos);
  yPos += 7;
  
  doc.text(`Payment Date: ${formatDateTime(payment.date)}`, 20, yPos);
  yPos += 7;
  
  doc.text(`Department: ${payment.department}`, 20, yPos);
  yPos += 7;

  // Status badge
  const statusColor: [number, number, number] = 
    payment.status === "Paid" ? [34, 197, 94] : [234, 179, 8];
  
  doc.setFillColor(...statusColor);
  doc.roundedRect(20, yPos, 25, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(payment.status, 22, yPos + 5);
  
  yPos += 15;

  // Payment Summary
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 42, 74);
  doc.text("Payment Summary", 20, yPos);
  yPos += 15;

  // Amount table
  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Amount"]],
    body: [
      ["Service Charge", `$${payment.amount.toFixed(2)}`],
      ["Tax", "$0.00"],
      ["Total Amount", `$${payment.amount.toFixed(2)}`],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [30, 136, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Payment Method (if paid)
  if (payment.status === "Paid") {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(30, 136, 229);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, 20, "FD");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Payment Method: Credit Card", 25, yPos + 8);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction ID: " + Math.random().toString(36).substr(2, 9).toUpperCase(), 25, yPos + 15);
    
    yPos += 30;
  }

  // Thank you note
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for your payment!", pageWidth / 2, yPos, { align: "center" });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "For questions about this bill, please contact billing@mychart.com",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `${payment.invoice.replace(/\s+/g, "_")}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(filename);
}

export function downloadOutstandingBill(
  bill: Bill,
  currentUser?: { firstName?: string; lastName?: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header with MyChart branding
  doc.setFillColor(30, 136, 229);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MyChart", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Outstanding Bill", 20, 33);

  yPos = 50;

  // Patient Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (currentUser?.firstName && currentUser?.lastName) {
    doc.text(`Patient: ${currentUser.firstName} ${currentUser.lastName}`, 20, yPos);
    yPos += 7;
  }
  
  doc.text(`Bill Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 15;

  // Bill Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 42, 74);
  doc.text("Bill Details", 20, yPos);
  yPos += 12;

  // Bill details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  doc.text(`Provider: ${bill.provider}`, 20, yPos);
  yPos += 7;
  
  doc.text(`Due Date: ${formatDateTime(bill.dueDate)}`, 20, yPos);
  yPos += 7;

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    Pending: [234, 179, 8],
    Paid: [34, 197, 94],
    Overdue: [239, 68, 68],
  };
  
  const statusColor = statusColors[bill.status] || [234, 179, 8];
  doc.setFillColor(...statusColor);
  doc.roundedRect(20, yPos, 30, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(bill.status, 22, yPos + 5);
  
  yPos += 15;

  // Amount Due Section
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.rect(20, yPos, pageWidth - 40, 30, "FD");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(127, 29, 29);
  doc.text("Amount Due", 25, yPos + 10);
  
  doc.setFontSize(24);
  doc.setTextColor(220, 38, 38);
  doc.text(`$${bill.amount.toFixed(2)}`, 25, yPos + 23);
  
  yPos += 40;

  // Payment Instructions
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(30, 136, 229);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos, pageWidth - 40, 35, "FD");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text("Payment Instructions", 25, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("• Pay online at mychart.com/billing", 25, yPos + 15);
  doc.text("• Call (555) 123-4567 to pay by phone", 25, yPos + 21);
  doc.text("• Mail check to: MyChart Billing, 123 Health St, Tampa FL 33602", 25, yPos + 27);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "For questions about this bill, please contact billing@mychart.com",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `${bill.provider.replace(/\s+/g, "_")}_Bill_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(filename);
}
