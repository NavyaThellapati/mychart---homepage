export function getPasswordValidationError(password: string): string | null {
  if (password.length < 10 || password.length > 128) {
    return "Password must contain between 10 and 128 characters";
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include an uppercase letter, a lowercase letter, and a number";
  }
  return null;
}
