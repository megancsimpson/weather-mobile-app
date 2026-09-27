const countryCodes: Record<string, string> = {
  canada: 'CA',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  australia: 'AU',
  france: 'FR',
  germany: 'DE',
  mexico: 'MX',
  japan: 'JP',
  india: 'IN',
  italy: 'IT',
  spain: 'ES',
  brazil: 'BR',
};

/**
 * Converts a country name, alias, or two-letter code into an ISO country code.
 * Returns null when the country is not recognized.
 */
export function getCountryCode(country: string): string | null {
  const normalizedCountry = country.trim().toLowerCase();

  // Check names and aliases first, so "UK" becomes the ISO code "GB".
  if (countryCodes[normalizedCountry]) {
    return countryCodes[normalizedCountry];
  }

  if (/^[a-z]{2}$/.test(normalizedCountry)) {
    return normalizedCountry.toUpperCase();
  }

  return null;
}
