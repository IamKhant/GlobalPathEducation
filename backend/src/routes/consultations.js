const express = require('express');
const { getAuth } = require('@clerk/express');
const { getOrCreateCurrentUser, requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireApiAuth, async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);

    const consultations = await req.prisma.consultation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        program: true,
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

router.post('/', async (req, res) => {
  try {
    const auth = getAuth(req);
    const user = auth.userId ? await getOrCreateCurrentUser(req) : null;
    const programId = req.body.programId ? Number.parseInt(req.body.programId, 10) : null;
    const consultantId = req.body.consultantId ? Number.parseInt(req.body.consultantId, 10) : null;

    const consultation = await req.prisma.consultation.create({
      data: {
        userId: user?.id || null,
        programId,
        consultantId,
        fullName: req.body.fullName || req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        preferredCountry: req.body.preferredCountry || null,
        studyLevel: req.body.studyLevel || null,
        message: req.body.message || null,
        status: 'pending',
      },
      include: {
        program: true,
      },
    });

    res.status(201).json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to book consultation',
    });
  }
});

router.patch('/:id/cancel', requireApiAuth, async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);
    const id = Number.parseInt(req.params.id, 10);

    const result = await req.prisma.consultation.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        status: 'cancelled',
      },
    });

    if (!result.count) {
      return res.status(404).json({
        message: 'Consultation not found',
      });
    }

    res.json({
      id,
      status: 'cancelled',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to cancel consultation',
    });
  }
});

module.exports = router;
