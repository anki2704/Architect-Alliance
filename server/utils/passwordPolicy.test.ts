import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordStrength, passwordChecks, PASSWORD_POLICY_MESSAGE } from './passwordPolicy.ts';

describe('validatePasswordStrength', () => {
  it('rejects short passwords', () => {
    assert.equal(validatePasswordStrength('Ab1!'), PASSWORD_POLICY_MESSAGE);
    assert.equal(validatePasswordStrength('Abcdef1!'), PASSWORD_POLICY_MESSAGE); // 8 chars
  });

  it('rejects passwords missing character classes', () => {
    assert.equal(validatePasswordStrength('abcdefghijkl'), PASSWORD_POLICY_MESSAGE); // no upper/digit/special
    assert.equal(validatePasswordStrength('ABCDEFGHIJKL1'), PASSWORD_POLICY_MESSAGE); // no lower/special
    assert.equal(validatePasswordStrength('Abcdefghijkl1'), PASSWORD_POLICY_MESSAGE); // no special
  });

  it('accepts strong 12+ char passwords', () => {
    assert.equal(validatePasswordStrength('SecurePass1!'), null);
    assert.equal(validatePasswordStrength('MyStr0ng!Pass'), null);
  });

  it('passwordChecks reports individual requirements', () => {
    const c = passwordChecks('Aa1!');
    assert.equal(c.minLength, false);
    assert.equal(c.hasUpper, true);
    assert.equal(c.hasLower, true);
    assert.equal(c.hasNumber, true);
    assert.equal(c.hasSpecial, true);
  });
});
