import { getCountryCode } from '@/utils/countries';

describe('getCountryCode', () => {
  it.each([
    ['Canada', 'CA'],
    ['united states', 'US'],
    ['USA', 'US'],
    ['UK', 'GB'],
    ['United Kingdom', 'GB'],
  ])('converts the country name "%s" to %s', (country, expected) => {
    expect(getCountryCode(country)).toBe(expected);
  });

  it('accepts any two-letter code and uppercases it', () => {
    expect(getCountryCode('nz')).toBe('NZ');
    expect(getCountryCode('Ca')).toBe('CA');
  });

  it('ignores surrounding spaces', () => {
    expect(getCountryCode('  canada  ')).toBe('CA');
  });

  it('returns null for an unknown country name', () => {
    expect(getCountryCode('Atlantis')).toBeNull();
  });

  it('returns null for codes that are not two letters', () => {
    expect(getCountryCode('CAN')).toBeNull();
    expect(getCountryCode('C1')).toBeNull();
  });
});
