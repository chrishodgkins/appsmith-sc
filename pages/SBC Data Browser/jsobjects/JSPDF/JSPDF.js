export default {
  IconButton1onClick () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Pull table data and headers
    const tableData = Table1.tableData.map(row => Object.values(row));
    const tableHeaders = Object.keys(Table1.tableData[0] || {});

    // Add title
    doc.text("Table Export", 14, 10);

    // Build the table in the PDF
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] },  // SecureCo blue vibe
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 20 },
    });

    // Save the file
    doc.save("table_export.pdf");
  }
}