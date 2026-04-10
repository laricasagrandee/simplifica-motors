

## Plan: Remove Device Fingerprint Verification from Signup

### Problem
If a user mistypers their email during signup, their device gets permanently blocked from creating another account, even though the email was wrong.

### Solution
Keep only email-based trial verification. Remove all device/fingerprint checks from both the Edge Function and the frontend signup page.

### Changes

**1. Edge Function (`supabase/functions/public-signup/index.ts`)**
- Remove the entire fingerprint check block (lines 92-117) that queries `device_fingerprints` by fingerprint
- Remove `fingerprint` and `device_type` from the destructured body and sanitization
- Keep the email-based trial check as-is (lines 55-90)
- Still insert a record into `device_fingerprints` at the end (for audit/tracking), but it no longer blocks signups

**2. Frontend (`src/pages/CriarContaPage.tsx`)**
- Remove the import of `getDeviceFingerprint` and `detectDeviceType`
- Remove fingerprint/device_type from the `supabase.functions.invoke` body
- No visual/layout changes needed — responsiveness stays intact

### What stays the same
- Email-based trial blocking (working as intended)
- Orphan cleanup for deleted tenants/users
- The `device_fingerprints` table remains untouched in the database
- All UI/responsiveness unchanged

