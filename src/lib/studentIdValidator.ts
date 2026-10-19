/**
 * Student ID format rules for Questify:
 * - Pattern: prefix "Mains", a hyphen, then exactly 5 digits. Regex: ^Mains-\d{5}$
 * - Case-insensitive on input ("mains-24813", "MAINS-24813", "Mains-24813" all work)
 * - Stored and displayed canonical form: "Mains-XXXXX"
 * - Rejects anything else with: "Enter your student ID in this format: Mains-24813"
 */

export const STUDENT_ID_ERROR_MESSAGE = 'Enter your student ID in this format: Mains-24813';
export const FACULTY_REDIRECT_MESSAGE = 'This page is for students. Use Faculty Login.';

/**
 * Normalizes a raw Student ID string:
 * Trims leading/trailing whitespace and standardizes prefix casing to 'Mains-'.
 */
export function normalizeStudentId(rawId: string): string {
  const trimmed = (rawId || '').trim();
  const match = trimmed.match(/^mains-(\d{5})$/i);
  if (match) {
    return `Mains-${match[1]}`;
  }
  return trimmed;
}

/**
 * Validates the student ID format according to the specification:
 * ^Mains-\d{5}$ (case-insensitive on input).
 */
export function validateStudentId(rawId: string): {
  isValid: boolean;
  normalizedId: string;
  error?: string;
} {
  const trimmed = (rawId || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalizedId: '',
      error: STUDENT_ID_ERROR_MESSAGE,
    };
  }

  // Check if someone enters an email or faculty identifier
  if (isFacultyIdentifier(trimmed)) {
    return {
      isValid: false,
      normalizedId: trimmed,
      error: FACULTY_REDIRECT_MESSAGE,
    };
  }

  const regex = /^mains-\d{5}$/i;
  if (!regex.test(trimmed)) {
    return {
      isValid: false,
      normalizedId: trimmed,
      error: STUDENT_ID_ERROR_MESSAGE,
    };
  }

  return {
    isValid: true,
    normalizedId: normalizeStudentId(trimmed),
  };
}

/**
 * Checks whether an input looks like a faculty identifier or email
 */
export function isFacultyIdentifier(raw: string): boolean {
  const clean = (raw || '').trim().toLowerCase();
  if (clean.includes('@')) return true;
  if (clean.startsWith('msot-fac') || clean.startsWith('fac-') || clean.includes('faculty')) return true;
  return false;
}
