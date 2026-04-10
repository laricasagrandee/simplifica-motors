

## Plan: Remove Tax Lines + Add Thermal Printer Support

### Part 1: Remove tax/base lines from comprovante

Remove "Base de Cálculo" and "Impostos estimados" lines from both the preview component and the PDF.

**Files to edit:**

1. **`src/components/nf/NFPreviewTotais.tsx`** — Remove lines 30-36 (the `<div>` with "Base de Cálculo" and the `{aliquota > 0 && ...}` block). Keep only: Serviços subtotal, Peças subtotal, Desconto (if any), and VALOR TOTAL.

2. **`src/lib/gerarPdfOS.ts`** (line 346) — Remove the `if (nf.aliquota > 0)` line that prints "Impostos estimados...".

### Part 2: Thermal printer format chooser

Add a dialog that appears before printing, letting the user pick between A4 and thermal (80mm cupom). Save the preference to `configuracoes` so it persists.

**Database migration:**
- Add column `formato_impressao` (`varchar`, default `'a4'`) to `configuracoes` table.

**Files to edit/create:**

3. **`src/types/database.ts`** — Add `formato_impressao?: string | null` to `Configuracao` interface.

4. **`src/hooks/useConfiguracoes.ts`** — Add `formato_impressao` to the update mutation's allowed fields.

5. **New: `src/components/nf/PrintFormatDialog.tsx`** — A simple dialog with two buttons: "Impressora Comum (A4)" and "Impressora Térmica (Cupom)". On click, saves the choice to `configuracoes` and triggers the print action. If a saved preference exists, skips the dialog and prints directly.

6. **New: `src/components/nf/NFCupomPreview.tsx`** — Thermal receipt component: narrow layout (max-width 80mm), small text, no images, receipt-style formatting:
   - Oficina name/CNPJ/tel at top (centered)
   - Dashed separator lines
   - Cliente name, veículo/placa
   - List of items (description, qty, total — no unit price column to save width)
   - Desconto if applicable
   - TOTAL in bold
   - Footer disclaimer
   - All text sized for thermal printing (~7-8pt equivalent)

7. **New: `src/lib/gerarPdfCupom.ts`** — PDF generation for thermal format using jsPDF with 80mm width, similar receipt layout.

8. **`src/components/nf/NFPreview.tsx`** — Replace the direct `window.print()` and `gerarPdfNF()` calls with the format chooser logic:
   - Load saved `formato_impressao` from config
   - If no preference saved, show `PrintFormatDialog`
   - If A4: current behavior (window.print / gerarPdfNF)
   - If thermal: render `NFCupomPreview` in a hidden print div and trigger print, or generate cupom PDF

9. **`src/pages/NFPage.tsx`** — Pass config data to support the format dialog when printing from the list.

### What stays the same
- All existing layouts and responsiveness
- Database structure for notas_fiscais
- WhatsApp sharing, view functionality

