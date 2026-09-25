/**
 * Shared password strength policy used by register, reset-password, and
 * admin-created designer accounts.
 * Minimum 12 characters, maximum 128, with upper/lowercase, digit, special.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Password must be 12–128 characters and include uppercase, lowercase, a number, and a special character.';

export function validatePasswordStrength(password: string): string | null {
  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    return PASSWORD_POLICY_MESSAGE;
  }
  return null;
}

export function passwordChecks(password: string) {
  return {
    minLength: password.length >= 12,
    maxLength: password.length <= 128,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };
}
