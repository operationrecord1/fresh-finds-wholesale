export const PASSWORD_REQUIREMENTS = "Use 12–128 characters with uppercase, lowercase, a number, and a symbol.";

export function validateArtisanPassword(password: string): string | null {
  if (password.length < 12 || password.length > 128) return PASSWORD_REQUIREMENTS;
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return PASSWORD_REQUIREMENTS;
  }
  return null;
}
