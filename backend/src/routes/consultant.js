const express = require('express');
const { requireConsultant } = require('../middleware/auth');

const router = express.Router();
const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

async function getAssignedCountries(req) {
  const assignments = await req.prisma.consultantCountry.findMany({
    where: {
      consultantId: req.currentUser.id,
    },
    select: {
      country: true,
    },
  });

  return assignments.map((assignment) => assignment.country);
}

function assignedConsultationWhere(consultantId, countries) {
  const or = [
    {
      consultantId,
    },
  ];

  if (countries.length) {
    or.push(
      {
        preferredCountry: {
          in: countries,
        },
      },
      {
        program: {
          is: {
            country: {
              in: countries,
            },
          },
        },
      },
    );
  }

  return {
    OR: or,
  };
}

router.get('/me', requireConsultant, async (req, res) => {
  const countries = await getAssignedCountries(req);
  res.json({
    user: req.currentUser,
    role: req.currentUser.role,
    countries,
  });
});

router.get('/dashboard', requireConsultant, async (req, res) => {
  try {
    const countries = await getAssignedCountries(req);
    const where = assignedConsultationWhere(req.currentUser.id, countries);

    const consultations = await req.prisma.consultation.findMany({
      where,
      include: {
        program: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });

    const statusCounts = await req.prisma.consultation.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });

    const studentIds = [...new Set(consultations.map((item) => item.userId).filter(Boolean))];

    res.json({
      totals: {
        consultations: await req.prisma.consultation.count({ where }),
        students: studentIds.length,
        assignedCountries: countries.length,
      },
      countries,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[normalizeStatus(item.status)] = item._count.status;
        return acc;
      }, {}),
      recentConsultations: consultations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch consultant dashboard',
    });
  }
});

router.get('/consultations', requireConsultant, async (req, res) => {
  try {
    const countries = await getAssignedCountries(req);
    const status = normalizeStatus(req.query.status);
    const where = assignedConsultationWhere(req.currentUser.id, countries);

    if (status && status !== 'all') where.status = status;

    const consultations = await req.prisma.consultation.findMany({
      where,
      include: {
        program: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch consultations',
    });
  }
});

router.patch('/consultations/:id/status', requireConsultant, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const status = normalizeStatus(req.body.status);
    const countries = await getAssignedCountries(req);
    const where = assignedConsultationWhere(req.currentUser.id, countries);

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
      });
    }

    const allowed = await req.prisma.consultation.findFirst({
      where: {
        id,
        ...where,
      },
    });

    if (!allowed) {
      return res.status(404).json({
        message: 'Consultation not found',
      });
    }

    const consultation = await req.prisma.consultation.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        program: true,
        user: true,
      },
    });

    res.json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update consultation status',
    });
  }
});

router.get('/students', requireConsultant, async (req, res) => {
  try {
    const countries = await getAssignedCountries(req);
    const consultations = await req.prisma.consultation.findMany({
      where: assignedConsultationWhere(req.currentUser.id, countries),
      include: {
        user: {
          include: {
            bookmarks: {
              include: {
                program: true,
              },
            },
            consultations: {
              include: {
                program: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const studentsById = new Map();
    consultations.forEach((consultation) => {
      if (consultation.user) studentsById.set(consultation.user.id, consultation.user);
    });

    res.json([...studentsById.values()]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch students',
    });
  }
});

module.exports = router;
