/**
 * Shared password strength policy used by register + reset-password.
 * Rules: exactly 8 characters, at least one uppercase, lowercase, digit, and special character.
 */

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Password must be exactly 8 characters and include uppercase, lowercase, a number, and a special character.';

export function validatePasswordStrength(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return PASSWORD_POLICY_MESSAGE;
  }
  if (!PASSWORD_REGEX.test(password)) {
    return PASSWORD_POLICY_MESSAGE;
  }
  return null;
}

export function passwordChecks(password: string) {
  return {
    exactLength: password.length === 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };
}
