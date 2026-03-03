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

        // The UI wraps the invoice in a container with overflow:hidden sized to
        // the scaled dimensions. After removing the transform the full-size element
        // would be clipped by that container, so we also reset it here.
        const parentEl = rootEl.parentElement
        if (parentEl) {
          parentEl.style.overflow = 'visible'
          parentEl.style.width = '794px'
          parentEl.style.height = 'auto'
        }
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

function buildPDF(canvas: HTMLCanvasElement): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // JPEG at 0.92 quality: visually indistinguishable from PNG for invoice content
  // but ~70% smaller file size compared to PNG
  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const imgHeightMM = (canvas.height / canvas.width) * A4_WIDTH_MM

  let heightLeft = imgHeightMM
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, A4_WIDTH_MM, imgHeightMM)
  heightLeft -= A4_HEIGHT_MM

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMM
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, A4_WIDTH_MM, imgHeightMM)
    heightLeft -= A4_HEIGHT_MM
  }

  return pdf
}

export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const canvas = await captureElement(elementId)
  buildPDF(canvas).save(filename)
}

export async function generatePDFBlob(elementId: string): Promise<Blob> {
  const canvas = await captureElement(elementId)
  return buildPDF(canvas).output('blob')
}
