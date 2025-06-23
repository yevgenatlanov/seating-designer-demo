import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDF(canvasElement: HTMLElement, data: any) {
  try {
    // Capture the canvas as an image
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: "#f9fafb",
      scale: 2,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("l", "mm", "a4") // landscape orientation

    // Add title
    pdf.setFontSize(20)
    pdf.text("Seating Map", 20, 20)

    // Add the seating chart image
    const imgWidth = 250
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight)

    // Add guest list on a new page
    pdf.addPage()
    pdf.setFontSize(16)
    pdf.text("Guest List", 20, 20)

    let yPosition = 35
    const lineHeight = 8

    // Group assignments by table
    const tableAssignments = new Map()
    data.seatAssignments.forEach((assignment: any) => {
      if (!tableAssignments.has(assignment.tableId)) {
        tableAssignments.set(assignment.tableId, [])
      }
      const person = data.people.find((p: any) => p.id === assignment.personId)
      if (person) {
        tableAssignments.get(assignment.tableId).push({
          ...person,
          seatIndex: assignment.seatIndex,
        })
      }
    })

    // List assignments by table
    tableAssignments.forEach((assignments, tableId) => {
      const tableIndex = data.tables.findIndex((t: any) => t.id === tableId) + 1
      const tableName = data.tables.find((t: any) => t.id === tableId)?.name || `Table ${tableIndex}`

      pdf.setFontSize(12)
      pdf.text(`${tableName}:`, 20, yPosition)
      yPosition += lineHeight

      assignments.sort((a: any, b: any) => a.seatIndex - b.seatIndex)
      assignments.forEach((person: any) => {
        const seatNumber = `t${tableIndex}-s${person.seatIndex + 1}`
        pdf.setFontSize(10)
        pdf.text(`  ${seatNumber}: ${person.name} - ${person.title}, ${person.company}`, 25, yPosition)
        yPosition += lineHeight - 1

        if (yPosition > 280) {
          // Near bottom of page
          pdf.addPage()
          yPosition = 20
        }
      })
      yPosition += 3 // Extra space between tables
    })

    // List unassigned people
    const assignedPersonIds = new Set(data.seatAssignments.map((a: any) => a.personId))
    const unassignedPeople = data.people.filter((p: any) => !assignedPersonIds.has(p.id))

    if (unassignedPeople.length > 0) {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(12)
      pdf.text("Unassigned Guests:", 20, yPosition)
      yPosition += lineHeight

      unassignedPeople.forEach((person: any) => {
        pdf.setFontSize(10)
        pdf.text(`  ${person.name} - ${person.title}, ${person.company}`, 25, yPosition)
        yPosition += lineHeight - 1

        if (yPosition > 280) {
          pdf.addPage()
          yPosition = 20
        }
      })
    }

    // Save the PDF
    pdf.save(`seating-map-${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
