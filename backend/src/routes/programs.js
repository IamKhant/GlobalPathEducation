const express = require('express');

const router = express.Router();

// GET /api/programs
router.get('/', async (req, res) => {
  try {
    const {
      search,
      country,
      type,
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

    const [programs, total] = await Promise.all([
      req.prisma.program.findMany({
        where,
        orderBy: {
          title: 'asc',
        },
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