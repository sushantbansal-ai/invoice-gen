import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

async function captureElement(elementId: string): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error(`Element with id "${elementId}" not found`)

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      // Reset transform on the invoice root so it's captured at full A4 size,
      // not the scaled-down preview size shown in the UI
      const rootEl = clonedDoc.getElementById(elementId)
      if (rootEl) {
        rootEl.style.transform = 'none'
        rootEl.style.transformOrigin = 'top left'
        rootEl.style.width = '794px'
      }

      const allEls = clonedDoc.querySelectorAll<HTMLElement>('*')
      allEls.forEach((el) => {
        el.style.boxShadow = 'none'
        el.style.transition = 'none'
        el.style.animation = 'none'
      })
    },
  })
}

export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const canvas = await captureElement(elementId)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const imgData = canvas.toDataURL('image/png')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeightMM = (canvas.height / canvas.width) * pageWidth

  let heightLeft = imgHeightMM
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMM)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMM
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMM)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

export async function generatePDFBlob(elementId: string): Promise<Blob> {
  const canvas = await captureElement(elementId)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const imgData = canvas.toDataURL('image/png')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeightMM = (canvas.height / canvas.width) * pageWidth

  let heightLeft = imgHeightMM
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMM)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMM
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeightMM)
    heightLeft -= pageHeight
  }

  return pdf.output('blob')
}

// Suppress unused warnings - these are used by the constants
void A4_WIDTH_MM
void A4_HEIGHT_MM
