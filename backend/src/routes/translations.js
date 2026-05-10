const express = require('express');
const { normalizeTargetLang, translateTexts } = require('../services/deepl');

const router = express.Router();

function normalizeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry) => ({
      key: typeof entry.key === 'string' ? entry.key.trim() : '',
      text: typeof entry.text === 'string' ? entry.text.trim() : '',
    }))
    .filter((entry) => entry.key && entry.text);
}

router.post('/ui', async (req, res) => {
  try {
    const locale = normalizeTargetLang(req.body.locale);
    const entries = normalizeEntries(req.body.entries);

    if (!locale) {
      return res.status(400).json({
        message: 'locale is required',
      });
    }

    if (!entries.length) {
      return res.json({
        locale,
        translations: {},
      });
    }

    if (locale === 'EN') {
      return res.json({
        locale,
        translations: Object.fromEntries(entries.map((entry) => [entry.key, entry.text])),
      });
    }

    const keys = entries.map((entry) => entry.key);
    const cachedTranslations = await req.prisma.uiTranslation.findMany({
      where: {
        locale,
        key: {
          in: keys,
        },
      },
    });

    const translations = Object.fromEntries(
      cachedTranslations.map((translation) => [translation.key, translation.text]),
    );

    const missingEntries = entries.filter((entry) => !translations[entry.key]);

    if (missingEntries.length) {
      const translatedTexts = await translateTexts(
        missingEntries.map((entry) => entry.text),
        locale,
      );

      await Promise.all(
        missingEntries.map((entry, index) =>
          req.prisma.uiTranslation.upsert({
            where: {
              locale_key: {
                locale,
                key: entry.key,
              },
            },
            update: {
              text: translatedTexts[index],
            },
            create: {
              locale,
              key: entry.key,
              text: translatedTexts[index],
            },
          }),
        ),
      );

      missingEntries.forEach((entry, index) => {
        translations[entry.key] = translatedTexts[index];
      });
    }

    res.json({
      locale,
      translations,
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to translate UI text',
    });
  }
});

module.exports = router;
