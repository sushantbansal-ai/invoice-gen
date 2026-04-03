import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export async function captureElement(elementId: string): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error(`Element with id "${elementId}" not found`)

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    // Override window scroll so html2canvas treats scroll as (0,0).
    // Without this, windowBounds.y = window.scrollY, which can push the
    // off-screen fixed element (at viewport top:0) outside the render window
    // when the page is scrolled, producing a blank canvas.
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      // The source element uses visibility:hidden to stay invisible to users.
      // Restore visibility so html2canvas actually renders its contents.
      const rootEl = clonedDoc.getElementById(elementId)
      if (rootEl) rootEl.style.visibility = 'visible'

      const allEls = clonedDoc.querySelectorAll<HTMLElement>('*')
      allEls.forEach((el) => {
        el.style.boxShadow = 'none'
        el.style.transition = 'none'
        el.style.animation = 'none'
        // html2canvas doesn't support inline-flex; convert to inline-block
        // so status badges render correctly in the PDF output.
        if (el.style.display === 'inline-flex') {
          el.style.display = 'inline-block'
          el.style.verticalAlign = 'middle'
        }
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

/** Download PDF directly from a pre-rendered canvas — no re-capture needed. */
export function generatePDFFromCanvas(canvas: HTMLCanvasElement, filename: string): void {
  buildPDF(canvas).save(filename)
}

/** Return PDF blob from a pre-rendered canvas — no re-capture needed. */
export function generatePDFBlobFromCanvas(canvas: HTMLCanvasElement): Blob {
  return buildPDF(canvas).output('blob')
}

// Legacy: capture element then generate — kept for external callers if any
export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const canvas = await captureElement(elementId)
  buildPDF(canvas).save(filename)
}

export async function generatePDFBlob(elementId: string): Promise<Blob> {
  const canvas = await captureElement(elementId)
  return buildPDF(canvas).output('blob')
}
