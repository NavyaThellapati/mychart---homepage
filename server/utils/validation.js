const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\-\s]{7,30}$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

function normalizePhone(value) {
  if (typeof value !== 'string') return null;
  const phone = value.trim();
  return PHONE_PATTERN.test(phone) ? phone : null;
}

function cleanText(value, { min = 1, max = 255, multiline = false } = {}) {
  if (typeof value !== 'string') return null;
  const withoutControlCharacters = value.replace(CONTROL_CHARACTERS, '');
  const text = multiline
    ? withoutControlCharacters.trim()
    : withoutControlCharacters.replace(/\s+/g, ' ').trim();
  return text.length >= min && text.length <= max ? text : null;
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    return 'Password must contain between 10 and 128 characters';
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include an uppercase letter, a lowercase letter, and a number';
  }
  return null;
}

module.exports = {
  cleanText,
  normalizeEmail,
  normalizePhone,
  validatePassword,
};
