

## Plan: Rename "Nota Fiscal" to "Comprovante" across all screens and PDF

All changes are text-only, no layout modifications.

### Files to edit (7 files)

**1. `src/components/nf/NFPreviewHeader.tsx`**
- Line 13: "NOTA FISCAL DE SERVIÇO" → "COMPROVANTE DE SERVIÇO", "NOTA FISCAL DE PRODUTO" → "COMPROVANTE DE PRODUTO"
- Line 48: Remove the `serie` line (`{serie && <p ...>Série: {serie}</p>}`)

**2. `src/components/nf/NFPreviewDestinatario.tsx`**
- Line 14: "DESTINATÁRIO / TOMADOR" → "CLIENTE"

**3. `src/components/nf/NFPreviewTotais.tsx`**
- Line 34: `Impostos (${aliquota}%)` → `Impostos estimados (${aliquota}%) — já inclusos no valor`
- Remove the `valor` display for impostos (show only the label text, no monetary value)

**4. `src/components/nf/NFPreviewRodape.tsx`**
- Remove "Código de verificação" line entirely (line 14)
- Line 17-19: Replace footer text with "Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e)."

**5. `src/components/nf/NFForm.tsx`**
- Line 55: "Emitir Nota Fiscal" → "Emitir Comprovante"
- Line 71: "Serviço (NFS-e)" → "Serviço", "Produto (NF-e)" → "Produto"
- Line 90: "Emitir Nota Fiscal" → "Gerar Comprovante"

**6. `src/components/nf/NFList.tsx`**
- Line 25: "Nenhuma nota fiscal" → "Nenhum comprovante", "Emita sua primeira nota fiscal" → "Emita seu primeiro comprovante"
- Line 32: "Nº NF" → "Nº"
- Line 68: "NF {nf.numero}" → "Nº {nf.numero}"

**7. `src/pages/NFPage.tsx`**
- Line 46: "Notas Fiscais" → "Comprovantes", "Emissão e consulta" stays
- Line 48: "Emitir NF" → "Novo Comprovante"

**8. `src/lib/gerarPdfOS.ts` (PDF generation)**
- Line 270: "NOTA FISCAL DE SERVIÇO/PRODUTO" → "COMPROVANTE DE SERVIÇO/PRODUTO"
- Line 276: Remove `Série` line
- Line 284: "DESTINATÁRIO" → "CLIENTE"
- Line 346: `Impostos (${nf.aliquota}%): ${formatarMoeda(...)}` → `Impostos estimados (${nf.aliquota}%) — já inclusos no valor` (no value)
- Line 358: Remove "Código de verificação" line
- Lines 359-360: Replace with "Comprovante gerado pelo sistema Facilita Motors. Este documento não substitui a nota fiscal eletrônica oficial (NF-e/NFS-e)."

**9. `src/components/nf/NFPreview.tsx`**
- Line 20: WhatsApp message "Nota Fiscal" → "Comprovante"

### What stays the same
- All layouts, spacing, responsiveness
- All functionality (PDF generation, WhatsApp, print)
- Database column names and queries

