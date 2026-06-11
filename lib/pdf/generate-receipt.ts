import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CartItem } from "@/lib/store";

export interface ReceiptData {
  orderRef: string;
  checkoutUrl: string;
  expiresAt: string;
  items: CartItem[];
  summary: {
    items_total: number;
    delivery_fee: number;
    addons_total: number;
    grand_total: number;
    currency: string;
  };
  recipient: {
    name: string;
    phone: string;
  };
  delivery: {
    address: string;
    city: string;
    date: string;
    locationType: string;
    instructions?: string;
  };
  sender: {
    name: string;
  };
  giftMessage?: string;
}

export function generateOrderReceipt(data: ReceiptData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // --- HEADER ---
  doc.setFillColor(88, 28, 135); // Purple
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KAPRUKA", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sri Lanka's Leading Online Gift Shop", margin, 25);

  doc.setFontSize(9);
  doc.text(`Receipt Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth - margin, 18, { align: "right" });
  doc.text(`Order Ref: ${data.orderRef}`, pageWidth - margin, 25, { align: "right" });

  y = 45;

  // --- ORDER CONFIRMATION TITLE ---
  doc.setTextColor(88, 28, 135);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Order Confirmation", margin, y);
  y += 10;

  // --- BILLING & DELIVERY SECTION ---
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Recipient Details", margin, y);
  doc.text("Delivery Details", pageWidth / 2 + 5, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  // Left column - Recipient
  doc.text(`Name: ${data.recipient.name}`, margin, y);
  doc.text(`Phone: ${data.recipient.phone}`, margin, y + 5);
  doc.text(`Sender: ${data.sender.name}`, margin, y + 10);

  // Right column - Delivery
  doc.text(`City: ${data.delivery.city}`, pageWidth / 2 + 5, y);
  doc.text(`Address: ${data.delivery.address}`, pageWidth / 2 + 5, y + 5);
  doc.text(`Date: ${data.delivery.date}`, pageWidth / 2 + 5, y + 10);
  doc.text(`Type: ${data.delivery.locationType}`, pageWidth / 2 + 5, y + 15);
  if (data.delivery.instructions) {
    doc.text(`Instructions: ${data.delivery.instructions}`, pageWidth / 2 + 5, y + 20);
  }

  y += 30;

  // --- PRODUCTS TABLE ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Products", margin, y);
  y += 4;

  const tableData = data.items.map((item, i) => [
    `${i + 1}`,
    item.name,
    `${item.quantity}`,
    `${data.summary.currency} ${item.price.toLocaleString()}`,
    `${data.summary.currency} ${(item.price * item.quantity).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "Qty", "Price", "Total"]],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [88, 28, 135],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [60, 60, 60],
    },
    alternateRowStyles: {
      fillColor: [248, 245, 255],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // --- TOTALS ---
  const totalsX = pageWidth - margin - 70;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  doc.text("Items Total:", totalsX, y);
  doc.text(`${data.summary.currency} ${data.summary.items_total.toLocaleString()}`, pageWidth - margin, y, { align: "right" });
  y += 6;

  doc.text("Delivery Fee:", totalsX, y);
  doc.text(`${data.summary.currency} ${data.summary.delivery_fee.toLocaleString()}`, pageWidth - margin, y, { align: "right" });
  y += 6;

  if (data.summary.addons_total > 0) {
    doc.text("Add-ons:", totalsX, y);
    doc.text(`${data.summary.currency} ${data.summary.addons_total.toLocaleString()}`, pageWidth - margin, y, { align: "right" });
    y += 6;
  }

  doc.setDrawColor(88, 28, 135);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text("Grand Total:", totalsX, y);
  doc.text(`${data.summary.currency} ${data.summary.grand_total.toLocaleString()}`, pageWidth - margin, y, { align: "right" });
  y += 12;

  // --- PAYMENT LINK ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Link", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(88, 28, 135);
  doc.textWithLink(data.checkoutUrl, margin, y, { url: data.checkoutUrl });
  y += 6;

  doc.setTextColor(180, 80, 80);
  doc.setFontSize(8);
  doc.text(`Expires: ${new Date(data.expiresAt).toLocaleString("en-GB")}`, margin, y);
  y += 10;

  // --- GIFT MESSAGE ---
  if (data.giftMessage) {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Gift Message", margin, y);
    y += 6;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const splitMsg = doc.splitTextToSize(`"${data.giftMessage}"`, pageWidth - margin * 2);
    doc.text(splitMsg, margin, y);
    y += splitMsg.length * 5 + 5;
  }

  // --- FOOTER ---
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(140, 140, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Kapruka.com | Sri Lanka's No.1 Online Gift Shop", pageWidth / 2, footerY, { align: "center" });
  doc.text("www.kapruka.com | support@kapruka.com | +94 11 5 400 400", pageWidth / 2, footerY + 4, { align: "center" });
  doc.text("This is a system-generated order confirmation receipt.", pageWidth / 2, footerY + 8, { align: "center" });

  // Return as data URL
  return doc.output("datauristring");
}

export function downloadReceipt(data: ReceiptData) {
  const doc = generateReceiptDoc(data);
  doc.save(`Kapruka-Order-${data.orderRef}.pdf`);
}

function generateReceiptDoc(data: ReceiptData): jsPDF {
  const dataUri = generateOrderReceipt(data);
  // Re-create for download (jsPDF doesn't allow save after datauristring)
  // So we'll just use the same logic but call save
  const doc = new jsPDF();
  // Instead of duplicating, we use a Blob approach
  const base64 = dataUri.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Kapruka-Order-${data.orderRef}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  return doc;
}
