const countryStyleByName = {
  australia: {
    gradient: 'linear-gradient(135deg, #00843D 0%, #1a6b3a 100%)',
  },
  canada: {
    gradient: 'linear-gradient(135deg, #cc0000 0%, #a00000 100%)',
  },
  germany: {
    gradient: 'linear-gradient(135deg, #2c2c2c 0%, #DD0000 100%)',
  },
  ireland: {
    gradient: 'linear-gradient(135deg, #169B62 0%, #0d7a4e 100%)',
  },
  japan: {
    gradient: 'linear-gradient(135deg, #BC002D 0%, #8a0020 100%)',
  },
  netherlands: {
    gradient: 'linear-gradient(135deg, #AE1C28 0%, #21468B 100%)',
  },
  'new zealand': {
    gradient: 'linear-gradient(135deg, #00247D 0%, #CC142B 100%)',
  },
  spain: {
    gradient: 'linear-gradient(135deg, #AA151B 0%, #c8960c 100%)',
  },
  malaysia: {
    gradient: 'linear-gradient(135deg, #010066 0%, #cc0001 100%)',
  },
  singapore: {
    gradient: 'linear-gradient(135deg, #EF3340 0%, #991b1b 100%)',
  },
  myanmar: {
    gradient: 'linear-gradient(135deg, #FECB00 0%, #34B233 48%, #EA2839 100%)',
  },
  burma: {
    gradient: 'linear-gradient(135deg, #FECB00 0%, #34B233 48%, #EA2839 100%)',
  },
  'united kingdom': {
    gradient: 'linear-gradient(135deg, #012169 0%, #C8102E 100%)',
  },
  uk: {
    gradient: 'linear-gradient(135deg, #012169 0%, #C8102E 100%)',
  },
  'united states': {
    gradient: 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
  },
  usa: {
    gradient: 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
  },
}

const defaultCountryStyle = {
  gradient: 'linear-gradient(135deg, #1a3a5c 0%, #2e7dc7 100%)',
}

export function getCountryStyle(countryName) {
  const normalizedName = countryName?.trim().toLowerCase()

  if (!normalizedName) return defaultCountryStyle

  return countryStyleByName[normalizedName] || defaultCountryStyle
}

export function getCountryGradient(countryName) {
  return getCountryStyle(countryName).gradient
}
