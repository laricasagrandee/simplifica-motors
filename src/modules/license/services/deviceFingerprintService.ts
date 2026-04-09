/**
 * Generates a browser fingerprint based on available signals.
 * Not cryptographically secure, but sufficient to deter casual abuse.
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // Screen
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0));

  // Device memory (Chrome only)
  components.push(String((navigator as any).deviceMemory || 0));

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('FacilitaMotors', 2, 2);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push('no-canvas');
  }

  // WebGL renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        components.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    components.push('no-webgl');
  }

  // Hash all components
  const raw = components.join('|');
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const FP_STORAGE_KEY = 'fm:device-fp';

/** Get or generate persistent fingerprint */
export async function getDeviceFingerprint(): Promise<string> {
  const saved = localStorage.getItem(FP_STORAGE_KEY);
  if (saved) return saved;

  const fp = await generateFingerprint();
  localStorage.setItem(FP_STORAGE_KEY, fp);
  return fp;
}
