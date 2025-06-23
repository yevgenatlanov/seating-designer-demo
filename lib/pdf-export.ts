import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(canvasElement: HTMLElement, data: any) {
  try {
    // Capture canvas as a screenshot
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    // Convert canvas px to mm
    const pxToMm = (px: number) => (px * 25.4) / 96;
    const widthMm = pxToMm(canvas.width);
    const heightMm = pxToMm(canvas.height);

    const pdf = new jsPDF({
      orientation: widthMm > heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [widthMm, heightMm],
    });

    // Page 1: Canvas Screenshot
    pdf.addImage(imgData, "PNG", 0, 0, widthMm, heightMm);

    // Page 2: Guest List
    pdf.addPage("a4", "portrait");
    pdf.setFontSize(16);
    pdf.text("Guest List", 20, 20);

    let yPosition = 35;
    const lineHeight = 8;

    // Group guests by table
    const tableAssignments = new Map();
    data.seatAssignments.forEach((assignment: any) => {
      if (!tableAssignments.has(assignment.tableId)) {
        tableAssignments.set(assignment.tableId, []);
      }

      const person = data.people.find((p: any) => p.id === assignment.personId);
      if (person) {
        tableAssignments.get(assignment.tableId).push({
          ...person,
          seatIndex: assignment.seatIndex,
        });
      }
    });

    // Table-by-table listing
    tableAssignments.forEach((assignments, tableId) => {
      const tableIndex =
        data.tables.findIndex((t: any) => t.id === tableId) + 1;
      const tableName =
        data.tables.find((t: any) => t.id === tableId)?.name ||
        `Table ${tableIndex}`;

      pdf.setFontSize(12);
      pdf.text(`${tableName}:`, 20, yPosition);
      yPosition += lineHeight;

      assignments.sort((a: any, b: any) => a.seatIndex - b.seatIndex);
      assignments.forEach((person: any) => {
        const seatLabel = `t${tableIndex}-s${person.seatIndex + 1}`;
        pdf.setFontSize(10);
        pdf.text(
          `  ${seatLabel}: ${person.name} - ${person.title}, ${person.company}`,
          25,
          yPosition
        );
        yPosition += lineHeight - 1;

        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      yPosition += 3;
    });

    // Unassigned guests
    const assignedIds = new Set(
      data.seatAssignments.map((a: any) => a.personId)
    );
    const unassigned = data.people.filter((p: any) => !assignedIds.has(p.id));

    if (unassigned.length > 0) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.text("Unassigned Guests:", 20, yPosition);
      yPosition += lineHeight;

      unassigned.forEach((person: any) => {
        pdf.setFontSize(10);
        pdf.text(
          `  ${person.name} - ${person.title}, ${person.company}`,
          25,
          yPosition
        );
        yPosition += lineHeight - 1;

        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }

    // Save final PDF
    pdf.save(`seating-map-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
