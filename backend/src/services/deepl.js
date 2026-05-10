const DEEPL_API_URL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2';

function normalizeTargetLang(locale) {
  if (typeof locale !== 'string') return '';

  return locale.trim().replace('_', '-').toUpperCase();
}

function ensureDeepLConfig() {
  if (!process.env.DEEPL_API_KEY) {
    const error = new Error('DEEPL_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }
}

async function translateTexts(texts, targetLang) {
  ensureDeepLConfig();

  const normalizedTargetLang = normalizeTargetLang(targetLang);
  const results = texts.map((text) => text || '');
  const textEntries = texts
    .map((text, index) => ({
      index,
      text: text || '',
    }))
    .filter((item) => item.text.trim());

  if (!textEntries.length) return results;

  const response = await fetch(`${DEEPL_API_URL}/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: textEntries.map((item) => item.text),
      target_lang: normalizedTargetLang,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || 'DeepL translation failed';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  data.translations.forEach((translation, index) => {
    results[textEntries[index].index] = translation.text;
  });

  return results;
}

module.exports = {
  normalizeTargetLang,
  translateTexts,
};
