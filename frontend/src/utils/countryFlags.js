const countryCodeByName = {
  australia: 'AU',
  austria: 'AT',
  myanmar: 'MM',
  burma: 'MM',
  belgium: 'BE',
  canada: 'CA',
  china: 'CN',
  'czech republic': 'CZ',
  czechia: 'CZ',
  denmark: 'DK',
  england: 'GB',
  finland: 'FI',
  france: 'FR',
  germany: 'DE',
  'hong kong': 'HK',
  india: 'IN',
  indonesia: 'ID',
  ireland: 'IE',
  italy: 'IT',
  japan: 'JP',
  korea: 'KR',
  malaysia: 'MY',
  netherlands: 'NL',
  'new zealand': 'NZ',
  norway: 'NO',
  philippines: 'PH',
  poland: 'PL',
  portugal: 'PT',
  singapore: 'SG',
  'south africa': 'ZA',
  'south korea': 'KR',
  spain: 'ES',
  sweden: 'SE',
  switzerland: 'CH',
  taiwan: 'TW',
  thailand: 'TH',
  uae: 'AE',
  'united arab emirates': 'AE',
  'united kingdom': 'GB',
  uk: 'GB',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  vietnam: 'VN',
}

function flagFromCountryCode(countryCode) {
  if (!/^[A-Z]{2}$/.test(countryCode || '')) return '🌏'

  return [...countryCode]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join('')
}

export function getCountryFlag(countryName) {
  const normalizedName = countryName?.trim().toLowerCase()
  const countryCode = countryCodeByName[normalizedName]

  return flagFromCountryCode(countryCode)
}
