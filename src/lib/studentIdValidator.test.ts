import { describe, it, expect } from 'vitest';
import {
  validateStudentId,
  normalizeStudentId,
  STUDENT_ID_ERROR_MESSAGE,
  FACULTY_REDIRECT_MESSAGE
} from './studentIdValidator';

describe('Student ID Format & Normalization Rules', () => {
  it('accepts canonical format Mains-24813', () => {
    const res = validateStudentId('Mains-24813');
    expect(res.isValid).toBe(true);
    expect(res.normalizedId).toBe('Mains-24813');
    expect(res.error).toBeUndefined();
  });

  it('accepts lowercase prefix mains-24813 and canonicalizes casing', () => {
    const res = validateStudentId('mains-24813');
    expect(res.isValid).toBe(true);
    expect(res.normalizedId).toBe('Mains-24813');
  });

  it('accepts uppercase prefix with whitespace "  MAINS-24813  " and trims and canonicalizes', () => {
    const res = validateStudentId('  MAINS-24813  ');
    expect(res.isValid).toBe(true);
    expect(res.normalizedId).toBe('Mains-24813');
  });

  it('rejects 4 digits: Mains-2481', () => {
    const res = validateStudentId('Mains-2481');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('rejects 6 digits: Mains-248130', () => {
    const res = validateStudentId('Mains-248130');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('rejects missing hyphen: Mains24813', () => {
    const res = validateStudentId('Mains24813');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('rejects old format: MSOT-2024-001', () => {
    const res = validateStudentId('MSOT-2024-001');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('rejects letters in the number: Mains-2481A', () => {
    const res = validateStudentId('Mains-2481A');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('rejects empty or whitespace-only field', () => {
    const res1 = validateStudentId('');
    expect(res1.isValid).toBe(false);
    expect(res1.error).toBe(STUDENT_ID_ERROR_MESSAGE);

    const res2 = validateStudentId('   ');
    expect(res2.isValid).toBe(false);
    expect(res2.error).toBe(STUDENT_ID_ERROR_MESSAGE);
  });

  it('identifies faculty email and instructs student login to use faculty login', () => {
    const res = validateStudentId('alan.vance@msot.edu');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(FACULTY_REDIRECT_MESSAGE);
  });

  it('identifies faculty ID prefix and instructs student login to use faculty login', () => {
    const res = validateStudentId('MSOT-FAC-001');
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(FACULTY_REDIRECT_MESSAGE);
  });

  it('correctly normalizes variations to Mains-XXXXX', () => {
    expect(normalizeStudentId('mains-12345')).toBe('Mains-12345');
    expect(normalizeStudentId('MAINS-99999')).toBe('Mains-99999');
    expect(normalizeStudentId('  Mains-00001  ')).toBe('Mains-00001');
  });
});
