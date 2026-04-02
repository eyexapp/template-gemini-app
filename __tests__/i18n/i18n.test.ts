import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale } from '@/i18n';

describe('i18n', () => {
  beforeEach(async () => {
    await setLocale('en');
  });

  it('should return English translations by default', () => {
    expect(t('app.title')).toBe('Gemini App');
    expect(getLocale()).toBe('en');
  });

  it('should switch to Turkish', async () => {
    await setLocale('tr');
    expect(t('app.title')).toBe('Gemini Uygulama');
    expect(getLocale()).toBe('tr');
  });

  it('should return key for missing translations', () => {
    const key = 'nonexistent.key' as Parameters<typeof t>[0];
    expect(t(key)).toBe('nonexistent.key');
  });
});
