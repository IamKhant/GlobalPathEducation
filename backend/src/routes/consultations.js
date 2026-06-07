const express = require('express');
const { getAuth } = require('@clerk/express');
const { getOrCreateCurrentUser, requireApiAuth } = require('../middleware/auth');
const { validateConsultationPayload } = require('../utils/consultationValidation');

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
    const validation = validateConsultationPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const { data } = validation;

    const [program, consultant] = await Promise.all([
      data.programId
        ? req.prisma.program.findUnique({ where: { id: data.programId }, select: { id: true } })
        : null,
      data.consultantId
        ? req.prisma.user.findFirst({
            where: { id: data.consultantId, role: 'consultant' },
            select: { id: true },
          })
        : null,
    ]);

    if (data.programId && !program) {
      return res.status(400).json({
        message: 'Selected program was not found',
      });
    }

    if (data.consultantId && !consultant) {
      return res.status(400).json({
        message: 'Selected consultant was not found',
      });
    }

    const consultation = await req.prisma.consultation.create({
      data: {
        userId: user?.id || null,
        programId: data.programId,
        consultantId: data.consultantId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        preferredCountry: data.preferredCountry,
        studyLevel: data.studyLevel,
        message: data.message,
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
