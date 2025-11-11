import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// TypeScript declaration for autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

interface Analyte {
  name: string;
  result: string;
  reference: string;
}

interface TestResult {
  id: string;
  name: string;
  collectedDate: string;
  orderedBy: string;
  lab?: string;
  labLocation?: string;
  status: string;
  analytes?: Analyte[];
  doctorNote?: string;
}

interface DownloadOptions {
  format: "pdf" | "csv";
  includeAnalytes: boolean;
  includeDoctorNotes: boolean;
}

function formatDateTime(dt: string) {
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function downloadTestReport(
  test: TestResult,
  options: DownloadOptions,
  currentUser?: { firstName?: string; lastName?: string }
) {
  if (options.format === "pdf") {
    downloadPDF(test, options, currentUser);
  } else {
    downloadCSV(test, options, currentUser);
  }
}

function downloadPDF(
  test: TestResult,
  options: DownloadOptions,
  currentUser?: { firstName?: string; lastName?: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header with logo placeholder
  doc.setFillColor(30, 136, 229);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MyChart", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Test Report", 20, 33);

  yPos = 50;

  // Patient Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  if (currentUser?.firstName && currentUser?.lastName) {
    doc.text(`Patient: ${currentUser.firstName} ${currentUser.lastName}`, 20, yPos);
    yPos += 7;
  }
  
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 15;

  // Test Information Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 42, 74);
  doc.text("Test Information", 20, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(test.name, 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  doc.text(`Collection Date: ${formatDateTime(test.collectedDate)}`, 20, yPos);
  yPos += 6;
  
  doc.text(`Ordered By: ${test.orderedBy}`, 20, yPos);
  yPos += 6;
  
  if (test.lab) {
    doc.text(`Laboratory: ${test.lab}`, 20, yPos);
    yPos += 6;
  }
  
  if (test.labLocation) {
    doc.text(`Lab Location: ${test.labLocation}`, 20, yPos);
    yPos += 6;
  }

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    Normal: [34, 197, 94],
    Abnormal: [239, 68, 68],
    Pending: [234, 179, 8],
    Archived: [156, 163, 175],
  };
  
  const statusColor = statusColors[test.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(20, yPos, 30, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(test.status, 22, yPos + 5);
  
  yPos += 15;

  // Analytes Table
  if (options.includeAnalytes && test.analytes && test.analytes.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 42, 74);
    doc.text("Test Results", 20, yPos);
    yPos += 10;

    const tableData = test.analytes.map((analyte) => [
      analyte.name,
      analyte.result,
      analyte.reference,
    ]);

    // Use autoTable with proper typing
    autoTable(doc, {
      startY: yPos,
      head: [["Analyte", "Result", "Reference Range"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [30, 136, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Doctor's Notes
  if (options.includeDoctorNotes && test.doctorNote) {
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, "F");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 42, 74);
    doc.text("Clinical Notes", 20, yPos);
    yPos += 10;

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(30, 136, 229);
    doc.setLineWidth(0.5);
    
    const noteLines = doc.splitTextToSize(test.doctorNote, pageWidth - 50);
    const noteHeight = noteLines.length * 6 + 10;
    
    doc.rect(20, yPos - 3, pageWidth - 40, noteHeight, "FD");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 58, 138);
    doc.text(noteLines, 25, yPos + 3);
    
    yPos += noteHeight + 10;
  }

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
      "This report contains protected health information - Handle with care",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `${test.name.replace(/\s+/g, "_")}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(filename);
}

function downloadCSV(
  test: TestResult,
  options: DownloadOptions,
  currentUser?: { firstName?: string; lastName?: string }
) {
  let csvContent = "";

  // Header
  csvContent += "MyChart Medical Test Report\n";
  csvContent += `Generated: ${new Date().toLocaleString()}\n`;
  
  if (currentUser?.firstName && currentUser?.lastName) {
    csvContent += `Patient: ${currentUser.firstName} ${currentUser.lastName}\n`;
  }
  
  csvContent += "\n";

  // Test Information
  csvContent += "Test Information\n";
  csvContent += `Test Name,${test.name}\n`;
  csvContent += `Collection Date,${formatDateTime(test.collectedDate)}\n`;
  csvContent += `Ordered By,${test.orderedBy}\n`;
  csvContent += `Status,${test.status}\n`;
  
  if (test.lab) {
    csvContent += `Laboratory,${test.lab}\n`;
  }
  
  if (test.labLocation) {
    csvContent += `Lab Location,${test.labLocation}\n`;
  }
  
  csvContent += "\n";

  // Analytes
  if (options.includeAnalytes && test.analytes && test.analytes.length > 0) {
    csvContent += "Test Results\n";
    csvContent += "Analyte,Result,Reference Range\n";
    
    test.analytes.forEach((analyte) => {
      csvContent += `"${analyte.name}","${analyte.result}","${analyte.reference}"\n`;
    });
    
    csvContent += "\n";
  }

  // Doctor's Notes
  if (options.includeDoctorNotes && test.doctorNote) {
    csvContent += "Clinical Notes\n";
    csvContent += `"${test.doctorNote.replace(/"/g, '""')}"\n`;
  }

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${test.name.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`
  );
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
