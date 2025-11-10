import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { ComprehensiveReport } from '../types';

// ✅ Export to PDF
export const exportReportToPDF = (report: ComprehensiveReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Analytics Report', pageWidth / 2, 15, { align: 'center' });

  // Report Period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const startDate = new Date(report.period.startDate).toLocaleDateString();
  const endDate = new Date(report.period.endDate).toLocaleDateString();
  doc.text(`Report Period: ${startDate} - ${endDate}`, pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, pageWidth / 2, 27, { align: 'center' });

  let yPosition = 35;

  // ===== SERVICE REQUESTS OVERVIEW =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Requests Overview', 14, yPosition);
  yPosition += 7;

  // Summary stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Requests: ${report.serviceRequests.total}`, 14, yPosition);
  doc.text(`Completion Rate: ${report.serviceRequests.completionRate}%`, 80, yPosition);
  doc.text(`Avg Completion Time: ${report.serviceRequests.avgCompletionTimeDays} days`, 150, yPosition);
  yPosition += 10;

  // Requests by Status
  if (report.serviceRequests.byStatus.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Status', 'Count', 'Percentage']],
      body: report.serviceRequests.byStatus.map(item => [
        item.status.replace(/_/g, ' '),
        item.count,
        `${item.percentage}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Requests by Type
  if (report.serviceRequests.byType.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Type', 'Count', 'Percentage']],
      body: report.serviceRequests.byType.map(item => [
        item.type,
        item.count,
        `${item.percentage}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== TECHNICIAN PERFORMANCE =====
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Technician Performance', 14, yPosition);
  yPosition += 7;

  if (report.technicianPerformance.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Region', 'Assigned', 'Completed', 'In Progress', 'Completion Rate', 'Avg Time']],
      body: report.technicianPerformance.map(tech => [
        tech.name,
        tech.region,
        tech.assigned,
        tech.completed,
        tech.inProgress,
        `${tech.completionRate}%`,
        `${tech.avgWorkDurationHours}h`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== REGIONAL BREAKDOWN =====
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Breakdown', 14, yPosition);
  yPosition += 7;

  if (report.regionalBreakdown.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Region', 'District', 'Requests', 'Completed', 'Rate', 'Customers', 'Technicians']],
      body: report.regionalBreakdown.map(region => [
        region.name,
        region.district || 'N/A',
        region.totalRequests,
        region.completedRequests,
        `${region.completionRate}%`,
        region.totalCustomers,
        region.totalTechnicians
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== CUSTOMER INSIGHTS =====
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Insights', 14, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`New Customers: ${report.customerActivity.newCustomers}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Total Customers: ${report.customerActivity.totalCustomers}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Avg Services per Customer: ${report.customerActivity.avgServicesPerCustomer}`, 14, yPosition);
  yPosition += 10;

  // Top Customers
  if (report.customerActivity.topCustomers.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Customer Name', 'Phone', 'Region', 'Total Services', 'Completed']],
      body: report.customerActivity.topCustomers.slice(0, 10).map(customer => [
        customer.name,
        customer.phone,
        customer.region,
        customer.totalServices,
        customer.completedServices
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== PRODUCT USAGE =====
  doc.addPage();
  yPosition = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Usage Statistics', 14, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Value Consumed: ₹${report.productUsage.totalValueConsumed}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Total Products Used: ${report.productUsage.totalProductsUsed}`, 14, yPosition);
  yPosition += 10;

  // Most Used Products
  if (report.productUsage.mostUsedProducts.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Product Name', 'SKU', 'Quantity Used', 'Times Used', 'Current Stock']],
      body: report.productUsage.mostUsedProducts.slice(0, 10).map(product => [
        product.name,
        product.sku,
        product.totalQuantityUsed,
        product.timesUsed,
        product.currentStock
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Low Stock Alert
  if (report.productUsage.lowStockProducts.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['⚠️ Low Stock Products', 'SKU', 'Current Stock']],
      body: report.productUsage.lowStockProducts.map(product => [
        product.name,
        product.sku || 'N/A',
        product.stock
      ]),
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] },
    });
  }

  // Save PDF
  const fileName = `Business_Report_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

// ✅ Export to Excel
export const exportReportToExcel = (report: ComprehensiveReport) => {
  const workbook = XLSX.utils.book_new();

  const startDate = new Date(report.period.startDate).toLocaleDateString();
  const endDate = new Date(report.period.endDate).toLocaleDateString();

  // ===== SUMMARY SHEET =====
  const summaryData = [
    ['Business Analytics Report'],
    [`Report Period: ${startDate} - ${endDate}`],
    [`Generated: ${new Date(report.generatedAt).toLocaleString()}`],
    [],
    ['SERVICE REQUESTS SUMMARY'],
    ['Total Requests', report.serviceRequests.total],
    ['Completion Rate', `${report.serviceRequests.completionRate}%`],
    ['Avg Completion Time', `${report.serviceRequests.avgCompletionTimeDays} days`],
    [],
    ['CUSTOMER INSIGHTS'],
    ['New Customers', report.customerActivity.newCustomers],
    ['Total Customers', report.customerActivity.totalCustomers],
    ['Avg Services per Customer', report.customerActivity.avgServicesPerCustomer],
    [],
    ['PRODUCT USAGE'],
    ['Total Value Consumed', `₹${report.productUsage.totalValueConsumed}`],
    ['Total Products Used', report.productUsage.totalProductsUsed],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // ===== REQUESTS BY STATUS =====
  if (report.serviceRequests.byStatus.length > 0) {
    const statusData = [
      ['Status', 'Count', 'Percentage'],
      ...report.serviceRequests.byStatus.map(item => [
        item.status.replace(/_/g, ' '),
        item.count,
        `${item.percentage}%`
      ])
    ];
    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Requests by Status');
  }

  // ===== REQUESTS BY TYPE =====
  if (report.serviceRequests.byType.length > 0) {
    const typeData = [
      ['Type', 'Count', 'Percentage'],
      ...report.serviceRequests.byType.map(item => [
        item.type,
        item.count,
        `${item.percentage}%`
      ])
    ];
    const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
    XLSX.utils.book_append_sheet(workbook, typeSheet, 'Requests by Type');
  }

  // ===== TECHNICIAN PERFORMANCE =====
  if (report.technicianPerformance.length > 0) {
    const techData = [
      ['Name', 'Email', 'Region', 'Assigned', 'Completed', 'In Progress', 'Completion Rate', 'Avg Work Time (hrs)'],
      ...report.technicianPerformance.map(tech => [
        tech.name,
        tech.email,
        tech.region,
        tech.assigned,
        tech.completed,
        tech.inProgress,
        `${tech.completionRate}%`,
        tech.avgWorkDurationHours
      ])
    ];
    const techSheet = XLSX.utils.aoa_to_sheet(techData);
    XLSX.utils.book_append_sheet(workbook, techSheet, 'Technician Performance');
  }

  // ===== REGIONAL BREAKDOWN =====
  if (report.regionalBreakdown.length > 0) {
    const regionData = [
      ['Region', 'District', 'City', 'Total Requests', 'Completed', 'Completion Rate', 'Customers', 'Technicians'],
      ...report.regionalBreakdown.map(region => [
        region.name,
        region.district || 'N/A',
        region.city || 'N/A',
        region.totalRequests,
        region.completedRequests,
        `${region.completionRate}%`,
        region.totalCustomers,
        region.totalTechnicians
      ])
    ];
    const regionSheet = XLSX.utils.aoa_to_sheet(regionData);
    XLSX.utils.book_append_sheet(workbook, regionSheet, 'Regional Breakdown');
  }

  // ===== TOP CUSTOMERS =====
  if (report.customerActivity.topCustomers.length > 0) {
    const customerData = [
      ['Customer Name', 'Phone', 'Region', 'Total Services', 'Completed Services'],
      ...report.customerActivity.topCustomers.map(customer => [
        customer.name,
        customer.phone,
        customer.region,
        customer.totalServices,
        customer.completedServices
      ])
    ];
    const customerSheet = XLSX.utils.aoa_to_sheet(customerData);
    XLSX.utils.book_append_sheet(workbook, customerSheet, 'Top Customers');
  }

  // ===== MOST USED PRODUCTS =====
  if (report.productUsage.mostUsedProducts.length > 0) {
    const productData = [
      ['Product Name', 'SKU', 'Quantity Used', 'Times Used', 'Current Stock', 'Estimated Value'],
      ...report.productUsage.mostUsedProducts.map(product => [
        product.name,
        product.sku,
        product.totalQuantityUsed,
        product.timesUsed,
        product.currentStock,
        `₹${product.estimatedValue}`
      ])
    ];
    const productSheet = XLSX.utils.aoa_to_sheet(productData);
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Usage');
  }

  // ===== LOW STOCK ALERT =====
  if (report.productUsage.lowStockProducts.length > 0) {
    const lowStockData = [
      ['⚠️ Product Name', 'SKU', 'Current Stock', 'Price'],
      ...report.productUsage.lowStockProducts.map(product => [
        product.name,
        product.sku || 'N/A',
        product.stock,
        `₹${product.price}`
      ])
    ];
    const lowStockSheet = XLSX.utils.aoa_to_sheet(lowStockData);
    XLSX.utils.book_append_sheet(workbook, lowStockSheet, 'Low Stock Alert');
  }

  // Save Excel
  const fileName = `Business_Report_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
