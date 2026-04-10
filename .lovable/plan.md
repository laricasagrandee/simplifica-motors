

## Plan: Always Show Format Dialog + Preview Before Print/PDF

### Changes (2 files)

**1. `src/components/nf/PrintFormatDialog.tsx`**
- Remove the `Checkbox` and "Lembrar minha escolha" (lines 42-51)
- Remove `salvar` state; simplify `onSelect` to just pass the format (no `salvar` param)
- Interface changes: `onSelect: (formato: 'a4' | 'cupom') => void`

**2. `src/components/nf/NFPreview.tsx`**
- Remove saved format logic: remove `useConfiguracoes`, `useAtualizarConfiguracoes`, `savedFormat`
- Change `handleAction`: always open the format dialog (never skip)
- After format is chosen, instead of immediately executing print/PDF, show a preview step:
  - Add state `chosenFormat: 'a4' | 'cupom' | null` to track the selected format
  - When format is chosen, set `chosenFormat` and keep the action pending
  - Render conditionally: if `chosenFormat === 'cupom'`, show `NFCupomPreview` inline (visible on screen, not hidden); if `'a4'`, show the existing A4 layout
  - Show a confirmation bar below the preview with "Confirmar Impressão" / "Confirmar PDF" and "Voltar" buttons
  - On confirm, execute the action (print or PDF)
  - On "Voltar", reset to normal view (clear `chosenFormat` and `pendingAction`)
- The normal view (no chosenFormat) shows the A4 preview as today with PDF/Imprimir/WhatsApp buttons
- Update `handleFormatSelect` to remove `salvar` parameter handling

### Flow
1. User clicks PDF or Imprimir
2. Format dialog appears (every time)
3. User picks A4 or Cupom
4. Dialog closes, preview updates to show the chosen format
5. Confirmation buttons appear below
6. User clicks confirm → action executes

### No other files change
Layout, responsiveness, and all other functionality remain the same.

