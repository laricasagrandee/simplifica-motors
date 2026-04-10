

## Plan: Fix Print Button to Use Same Template as View

### Problem
The print button (printer icon) in the comprovantes list calls `window.print()` on the entire page, producing a completely different layout from the preview. The view button (eye icon) opens the `NFPreview` component in a dialog with the correct layout.

### Solution
Make the print button open the same preview dialog, then automatically trigger `window.print()` once the content loads.

### Changes (1 file)

**`src/pages/NFPage.tsx`**
- Add a `printId` state alongside `previewId`
- Change `onImprimir` to set both `previewId` and `printId` to the clicked NF id (opens the dialog with the preview)
- Add a `useEffect` that watches: when `printId` is set, `nfCompleta.data` is loaded, and `printId === previewId`, call `window.print()` after a short delay (300ms for render), then clear `printId`
- This reuses the exact same `NFPreview` component and dialog for both actions

### What stays the same
- All layouts, responsiveness, and text
- The view (eye) button behavior unchanged
- The `NFPreview` component unchanged

