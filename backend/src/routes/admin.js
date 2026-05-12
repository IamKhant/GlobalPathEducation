const express = require('express');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function normalizeCountries(countries) {
  if (!Array.isArray(countries)) return [];
  return [...new Set(countries.map((country) => String(country || '').trim()).filter(Boolean))];
}

function normalizeUiEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry) => ({
      key: typeof entry.key === 'string' ? entry.key.trim() : '',
      text: typeof entry.text === 'string' ? entry.text.trim() : '',
    }))
    .filter((entry) => entry.key && entry.text);
}

function parseProgramPayload(body) {
  return {
    title: body.title,
    institution: body.institution,
    city: body.city || null,
    stateProvince: body.stateProvince || null,
    country: body.country,
    type: body.type,
    durationMonths: body.durationMonths ? Number.parseInt(body.durationMonths, 10) : null,
    tuitionFee: body.tuitionFee !== '' && body.tuitionFee != null ? Number.parseFloat(body.tuitionFee) : null,
    currency: body.currency ? String(body.currency).trim().toUpperCase() : null,
    feeBasis: body.feeBasis || null,
    language: body.language || null,
    specialization: body.specialization || null,
    websiteUrl: body.websiteUrl || null,
    description: body.description || null,
    cardColor: body.cardColor || null,
    notes: body.notes || null,
  };
}

router.get('/me', requireAdmin, (req, res) => {
  res.json({
    user: req.currentUser,
    role: req.currentUser.role,
  });
});

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [consultationTotal, studentTotal, consultantTotal, programTotal] = await Promise.all([
      req.prisma.consultation.count(),
      req.prisma.user.count({ where: { role: 'student' } }),
      req.prisma.user.count({ where: { role: 'consultant' } }),
      req.prisma.program.count(),
    ]);

    const [recentConsultations, recentStudents, recentPrograms, statusCounts] = await Promise.all([
      req.prisma.consultation.findMany({
        include: { program: true, user: true, consultant: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      req.prisma.user.findMany({
        where: { role: 'student' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      req.prisma.program.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      req.prisma.consultation.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    res.json({
      totals: {
        consultations: consultationTotal,
        students: studentTotal,
        consultants: consultantTotal,
        programs: programTotal,
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[normalizeStatus(item.status)] = item._count.status;
        return acc;
      }, {}),
      recentConsultations,
      recentStudents,
      recentPrograms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch admin dashboard' });
  }
});

router.get('/consultations', requireAdmin, async (req, res) => {
  try {
    const status = normalizeStatus(req.query.status);
    const where = status && status !== 'all' ? { status } : {};

    const consultations = await req.prisma.consultation.findMany({
      where,
      include: { program: true, user: true, consultant: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(consultations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
});

router.patch('/consultations/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const status = normalizeStatus(req.body.status);
    const consultantId = req.body.consultantId ? Number.parseInt(req.body.consultantId, 10) : null;
    const data = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      data.status = status;
    }

    if ('consultantId' in req.body) {
      data.consultantId = consultantId;
    }

    const consultation = await req.prisma.consultation.update({
      where: { id },
      data,
      include: { program: true, user: true, consultant: true },
    });

    res.json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update consultation' });
  }
});

router.get('/students', requireAdmin, async (req, res) => {
  try {
    const students = await req.prisma.user.findMany({
      where: { role: 'student' },
      include: {
        bookmarks: { include: { program: true } },
        consultations: { include: { program: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

router.delete('/students/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    const result = await req.prisma.user.deleteMany({
      where: { id, role: 'student' },
    });

    if (!result.count) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

router.get('/consultants', requireAdmin, async (req, res) => {
  try {
    const consultants = await req.prisma.user.findMany({
      where: { role: 'consultant' },
      include: {
        consultantCountries: { orderBy: { country: 'asc' } },
        assignedConsultations: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(consultants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch consultants' });
  }
});

router.get('/admins', requireAdmin, async (req, res) => {
  try {
    const admins = await req.prisma.user.findMany({
      where: { role: 'admin' },
      include: {
        assignedConsultations: { orderBy: { createdAt: 'desc' } },
        consultations: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch admins' });
  }
});

router.patch('/consultants/:id/profile', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const consultantBio = typeof req.body.consultantBio === 'string'
      ? req.body.consultantBio.trim() || null
      : null;

    const existing = await req.prisma.user.findFirst({
      where: { id, role: 'consultant' },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    const consultant = await req.prisma.user.update({
      where: { id },
      data: { consultantBio },
      include: {
        consultantCountries: { orderBy: { country: 'asc' } },
        assignedConsultations: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.json(consultant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update consultant profile' });
  }
});

router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const role = String(req.body.role || '').trim().toLowerCase();

    if (!['student', 'consultant', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (req.currentUser.id === id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin access' });
    }

    const user = await req.prisma.user.update({
      where: { id },
      data: { role },
      include: { consultantCountries: true },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

router.patch('/consultants/:id/countries', requireAdmin, async (req, res) => {
  try {
    const consultantId = Number.parseInt(req.params.id, 10);
    const countries = normalizeCountries(req.body.countries);

    const consultant = await req.prisma.user.findFirst({
      where: { id: consultantId, role: 'consultant' },
    });

    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    await req.prisma.$transaction([
      req.prisma.consultantCountry.deleteMany({ where: { consultantId } }),
      ...countries.map((country) =>
        req.prisma.consultantCountry.create({
          data: { consultantId, country },
        }),
      ),
    ]);

    const updated = await req.prisma.user.findUnique({
      where: { id: consultantId },
      include: { consultantCountries: { orderBy: { country: 'asc' } } },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update consultant countries' });
  }
});

router.patch('/ui-text', requireAdmin, async (req, res) => {
  try {
    const locale = String(req.body.locale || 'EN').trim().toUpperCase();
    const entries = normalizeUiEntries(req.body.entries);

    if (!entries.length) {
      return res.status(400).json({ message: 'At least one text entry is required' });
    }

    await Promise.all(
      entries.map((entry) =>
        req.prisma.uiTranslation.upsert({
          where: {
            locale_key: {
              locale,
              key: entry.key,
            },
          },
          update: {
            text: entry.text,
          },
          create: {
            locale,
            key: entry.key,
            text: entry.text,
          },
        }),
      ),
    );

    const saved = await req.prisma.uiTranslation.findMany({
      where: {
        locale,
        key: {
          in: entries.map((entry) => entry.key),
        },
      },
    });

    res.json({
      locale,
      translations: Object.fromEntries(saved.map((entry) => [entry.key, entry.text])),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update UI text' });
  }
});

router.get('/programs', requireAdmin, async (req, res) => {
  try {
    const programs = await req.prisma.program.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 150,
    });

    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
});

router.post('/programs', requireAdmin, async (req, res) => {
  try {
    const payload = parseProgramPayload(req.body);

    if (!payload.title || !payload.institution || !payload.country || !payload.type) {
      return res.status(400).json({ message: 'Title, institution, country, and type are required' });
    }

    const program = await req.prisma.program.create({ data: payload });
    res.status(201).json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create program' });
  }
});

router.patch('/programs/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const payload = parseProgramPayload(req.body);

    if (!payload.title || !payload.institution || !payload.country || !payload.type) {
      return res.status(400).json({ message: 'Title, institution, country, and type are required' });
    }

    const program = await req.prisma.program.update({
      where: { id },
      data: payload,
    });

    res.json(program);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update program' });
  }
});

router.delete('/programs/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    await req.prisma.program.delete({ where: { id } });
    res.json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete program' });
  }
});

module.exports = router;
