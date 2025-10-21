import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Generate a new 2FA secret and QR code for Google Authenticator
 */
export async function generateTwoFactorSecret(email: string, appName: string = "Rauta Tech") {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${email})`,
    issuer: appName,
    length: 32,
  });

  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
    otpauthUrl: secret.otpauth_url,
  };
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(secret: string, token: string): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time windows (30 seconds each way)
    });

    return verified;
  } catch (error) {
    console.error("[2FA] Verification error:", error);
    return false;
  }
}

/**
 * Verify a backup code and remove it from the list
 */
export function verifyBackupCode(
  backupCodes: string[],
  code: string
): { valid: boolean; remainingCodes: string[] } {
  const index = backupCodes.indexOf(code.toUpperCase());

  if (index === -1) {
    return { valid: false, remainingCodes: backupCodes };
  }

  // Remove the used code
  const remainingCodes = backupCodes.filter((_, i) => i !== index);

  return { valid: true, remainingCodes };
}

/**
 * Generate a new set of backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
}

