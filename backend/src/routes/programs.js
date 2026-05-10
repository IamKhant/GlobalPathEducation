const express = require('express');
const { requireApiAuth } = require('../middleware/auth');
const { normalizeTargetLang, translateTexts } = require('../services/deepl');

const router = express.Router();

// GET /api/programs
router.get('/', async (req, res) => {
  try {
    const {
      search,
      country,
      type,
      specialization,
      duration,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          institution: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          specialization: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          country: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (country) {
      where.country = country;
    }

    if (type) {
      where.type = type;
    }

    if (specialization) {
      where.specialization = {
        contains: specialization,
        mode: 'insensitive',
      };
    }

    if (duration) {
      where.durationMonths = {
        lte: Number.parseInt(duration, 10),
      };
    }

    let orderBy = {
      title: 'asc',
    };

    if (sort === 'tuition_asc') {
      orderBy = { tuitionFee: 'asc' };
    }

    if (sort === 'tuition_desc') {
      orderBy = { tuitionFee: 'desc' };
    }

    if (sort === 'duration_asc') {
      orderBy = { durationMonths: 'asc' };
    }

    if (sort === 'duration_desc') {
      orderBy = { durationMonths: 'desc' };
    }

    const [programs, total] = await Promise.all([
      req.prisma.program.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
      }),
      req.prisma.program.count({ where }),
    ]);

    res.json({
      data: programs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch programs',
    });
  }
});

// GET /api/programs/meta
router.get('/meta', async (req, res) => {
  try {
    const countries = await req.prisma.program.findMany({
      distinct: ['country'],
      select: {
        country: true,
      },
      orderBy: {
        country: 'asc',
      },
    });

    const types = await req.prisma.program.findMany({
      distinct: ['type'],
      select: {
        type: true,
      },
      orderBy: {
        type: 'asc',
      },
    });

    res.json({
      countries: countries.map((item) => item.country),
      types: types.map((item) => item.type),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch filter options',
    });
  }
});

// POST /api/programs/:id/translation
router.post('/:id/translation', requireApiAuth, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const targetLang = normalizeTargetLang(req.body.targetLang || req.body.locale);
    const refresh = req.body.refresh === true;

    if (!targetLang) {
      return res.status(400).json({
        message: 'targetLang is required',
      });
    }

    const program = await req.prisma.program.findUnique({
      where: {
        id,
      },
      include: {
        translations: {
          where: {
            locale: targetLang,
          },
        },
      },
    });

    if (!program) {
      return res.status(404).json({
        message: 'Program not found',
      });
    }

    if (!refresh && program.translations[0]) {
      return res.json(program.translations[0]);
    }

    const [title, specialization, description] = await translateTexts(
      [program.title, program.specialization, program.description],
      targetLang,
    );

    const translation = await req.prisma.programTranslation.upsert({
      where: {
        programId_locale: {
          programId: program.id,
          locale: targetLang,
        },
      },
      update: {
        title,
        specialization,
        description,
      },
      create: {
        programId: program.id,
        locale: targetLang,
        title,
        specialization,
        description,
      },
    });

    res.json(translation);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to translate program',
    });
  }
});

// GET /api/programs/:id/translation?locale=DE
router.get('/:id/translation', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const locale = normalizeTargetLang(req.query.locale || req.query.targetLang);

    if (!locale) {
      return res.status(400).json({
        message: 'locale is required',
      });
    }

    const translation = await req.prisma.programTranslation.findUnique({
      where: {
        programId_locale: {
          programId: id,
          locale,
        },
      },
    });

    if (!translation) {
      return res.status(404).json({
        message: 'Translation not found',
      });
    }

    res.json(translation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch translation',
    });
  }
});

// GET /api/programs/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    const program = await req.prisma.program.findUnique({
      where: {
        id,
      },
    });

    if (!program) {
      return res.status(404).json({
        message: 'Program not found',
      });
    }

    res.json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch program',
    });
  }
});

module.exports = router;
