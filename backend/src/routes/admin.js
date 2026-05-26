const express = require('express');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const autoPromotionThreshold = 80;

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

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatProgramMoney(program) {
  if (program.tuitionFee === 0) return 'Free';
  if (program.tuitionFee == null || !program.currency) return 'Contact institution';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: program.currency,
    maximumFractionDigits: 0,
  }).format(program.tuitionFee);
}

function feeBasisLabel(feeBasis) {
  return {
    annual: '/ year',
    total: 'total',
    per_term: '/ term',
  }[feeBasis] || '';
}

function programPromotionEmail(student, program) {
  const studentName = student.firstName || userName(student);
  const location = [program.city, program.country].filter(Boolean).join(', ');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const programUrl = `${frontendUrl.replace(/\/$/, '')}/programs/${program.id}`;
  const tuition = `${formatProgramMoney(program)} ${feeBasisLabel(program.feeBasis)}`.trim();
  const subject = `Recommended program: ${program.title}`;
  const text = `Hi ${studentName},

We found a program that may match your study preferences.

Program Name: ${program.title}
Institution: ${program.institution}
Program Type: ${program.type}
Location: ${location || '-'}
Duration: ${program.durationMonths ? `${program.durationMonths} months` : '-'}
Tuition: ${tuition}

View program: ${programUrl}
${program.websiteUrl ? `Official page: ${program.websiteUrl}` : ''}

You can review this program in GlobalPath Education or book a consultation if you would like guidance.

Best,
GlobalPath Education`;

  const rows = [
    ['Program Name', program.title],
    ['Institution', program.institution],
    ['Program Type', program.type],
    ['Location', location || '-'],
    ['Duration', program.durationMonths ? `${program.durationMonths} months` : '-'],
    ['Tuition', tuition],
    ['Language', program.language || '-'],
  ];

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5edf7;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#0f172a;padding:24px 28px;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#f4a41b;">GlobalPath Education</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;">A program recommendation for you</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(studentName)},</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#475569;">
                  Based on your study preferences, our team found a program that may be a strong fit for your goals.
                </p>

                <div style="border:1px solid #dbe3ef;border-radius:12px;overflow:hidden;margin:0 0 22px;">
                  <div style="background:#f8fafc;padding:14px 16px;border-bottom:1px solid #dbe3ef;">
                    <strong style="font-size:15px;color:#0f172a;">Program Details</strong>
                  </div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    ${rows
                      .map(([label, value]) => `
                    <tr>
                      <td style="width:36%;padding:12px 16px;border-bottom:1px solid #eef2f7;color:#64748b;font-size:13px;font-weight:700;">${escapeHtml(label)}</td>
                      <td style="padding:12px 16px;border-bottom:1px solid #eef2f7;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
                    </tr>`)
                      .join('')}
                  </table>
                </div>

                <div style="margin:0 0 22px;">
                  <a href="${escapeHtml(programUrl)}" style="display:inline-block;background:#f4a41b;color:#0f172a;text-decoration:none;font-weight:800;border-radius:999px;padding:12px 18px;margin-right:8px;">View Program</a>
                  ${
                    program.websiteUrl
                      ? `<a href="${escapeHtml(program.websiteUrl)}" style="display:inline-block;background:#ffffff;color:#1a3a5c;text-decoration:none;font-weight:800;border:1px solid #cbd5e1;border-radius:999px;padding:11px 18px;">Official Website</a>`
                      : ''
                  }
                </div>

                <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
                  If you would like help deciding whether this program is right for you, you can book a consultation through GlobalPath Education.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #e5edf7;padding:18px 28px;color:#64748b;font-size:12px;line-height:1.5;">
                You received this email because you created a GlobalPath Education profile and this program matched your study preferences.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function sameText(a, b) {
  return normalizeText(a) === normalizeText(b);
}

function studyLevelToProgramType(levelKey) {
  return {
    'profile.level.diploma': 'Diploma',
    'profile.level.bachelor': 'Bachelor',
    'profile.level.master': 'Master',
    'profile.level.bootcamp': 'Bootcamp',
    'profile.level.shortCourse': 'Bootcamp',
  }[levelKey] || '';
}

function programBudgetScore(student, program) {
  const budget = Number(student.maxBudget);
  const tuition = Number(program.tuitionFee);

  if (!budget || !tuition || !student.budgetCurrency || !program.currency) return null;
  if (!sameText(student.budgetCurrency, program.currency)) return null;

  if (tuition <= budget) return 'within';
  if (tuition <= budget * 1.15) return 'near';
  return 'over';
}

function hasCompletePromotionProfile(student) {
  return Boolean(
    student.preferredDestination &&
      student.preferredStudyLevel &&
      student.maxBudget &&
      student.budgetCurrency,
  );
}

function scoreStudentForProgram(student, program) {
  const reasons = [];
  let rawScore = 25;

  if (sameText(student.preferredDestination, program.country)) {
    rawScore += 30;
    reasons.push('Destination match');
  }

  const preferredType = studyLevelToProgramType(student.preferredStudyLevel);
  if (preferredType && sameText(preferredType, program.type)) {
    rawScore += 28;
    reasons.push('Study level match');
  }

  const budgetScore = programBudgetScore(student, program);
  if (budgetScore === 'within') {
    rawScore += 24;
    reasons.push('Within budget');
  } else if (budgetScore === 'near') {
    rawScore += 12;
    reasons.push('Near budget');
  }

  if (reasons.length === 0 && hasCompletePromotionProfile(student)) {
    reasons.push('Profile complete');
  }

  return {
    student,
    rawScore,
    score: Math.min(99, Math.max(40, rawScore)),
    reasons: reasons.slice(0, 3),
  };
}

async function sendResendEmail({ to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    const error = new Error('RESEND_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'GlobalPath Education <onboarding@resend.dev>',
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to send email');
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function createProgramPromotion({ prisma, program, student, adminId, matchScore, matchReasons }) {
  const { subject, text: message, html } = programPromotionEmail(student, program);

  try {
    const sent = await sendResendEmail({
      to: student.email,
      subject,
      text: message,
      html,
    });

    return prisma.programPromotion.create({
      data: {
        programId: program.id,
        studentId: student.id,
        adminId,
        email: student.email,
        subject,
        message,
        status: 'sent',
        providerMessageId: sent.id || null,
        matchScore,
        matchReasons: matchReasons.join(', ') || null,
      },
      include: {
        program: true,
        student: true,
        admin: true,
      },
    });
  } catch (sendError) {
    const promotion = await prisma.programPromotion.create({
      data: {
        programId: program.id,
        studentId: student.id,
        adminId,
        email: student.email,
        subject,
        message,
        status: 'failed',
        matchScore,
        matchReasons: matchReasons.join(', ') || null,
        errorMessage: sendError.message,
      },
    });

    sendError.promotion = promotion;
    throw sendError;
  }
}

async function autoEmailMatchedStudents({ prisma, program, adminId }) {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
  });

  const matches = students
    .map((student) => scoreStudentForProgram(student, program))
    .filter((match) => match.score > autoPromotionThreshold && match.student.email)
    .sort((a, b) => b.rawScore - a.rawScore);

  if (!matches.length) {
    return {
      threshold: autoPromotionThreshold,
      matched: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      sentStudentIds: [],
      skippedStudentIds: [],
      failedStudentIds: [],
    };
  }

  const existingSent = await prisma.programPromotion.findMany({
    where: {
      programId: program.id,
      studentId: { in: matches.map((match) => match.student.id) },
      status: 'sent',
    },
    select: { studentId: true },
  });
  const alreadySentStudentIds = new Set(existingSent.map((item) => item.studentId));

  const summary = {
    threshold: autoPromotionThreshold,
    matched: matches.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    sentStudentIds: [],
    skippedStudentIds: [],
    failedStudentIds: [],
  };

  for (const match of matches) {
    if (alreadySentStudentIds.has(match.student.id)) {
      summary.skipped += 1;
      summary.skippedStudentIds.push(match.student.id);
      continue;
    }

    try {
      await createProgramPromotion({
        prisma,
        program,
        student: match.student,
        adminId,
        matchScore: match.score,
        matchReasons: match.reasons,
      });
      summary.sent += 1;
      summary.sentStudentIds.push(match.student.id);
    } catch (error) {
      console.error(error);
      summary.failed += 1;
      summary.failedStudentIds.push(match.student.id);
    }
  }

  return summary;
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
    const autoPromotions = await autoEmailMatchedStudents({
      prisma: req.prisma,
      program,
      adminId: req.currentUser.id,
    });

    res.status(201).json({ ...program, autoPromotions });
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

    const autoPromotions = await autoEmailMatchedStudents({
      prisma: req.prisma,
      program,
      adminId: req.currentUser.id,
    });

    res.json({ ...program, autoPromotions });
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

router.post('/program-promotions/send', requireAdmin, async (req, res) => {
  try {
    const programId = Number.parseInt(req.body.programId, 10);
    const studentId = Number.parseInt(req.body.studentId, 10);
    const matchScore = req.body.matchScore ? Number.parseInt(req.body.matchScore, 10) : null;
    const matchReasons = Array.isArray(req.body.matchReasons)
      ? req.body.matchReasons.map((reason) => String(reason).trim()).filter(Boolean)
      : [];

    if (!programId || !studentId) {
      return res.status(400).json({ message: 'programId and studentId are required' });
    }

    const [program, student] = await Promise.all([
      req.prisma.program.findUnique({ where: { id: programId } }),
      req.prisma.user.findFirst({ where: { id: studentId, role: 'student' } }),
    ]);

    if (!program) return res.status(404).json({ message: 'Program not found' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    try {
      const existingSent = await req.prisma.programPromotion.findFirst({
        where: { programId, studentId, status: 'sent' },
      });

      if (existingSent) {
        return res.status(409).json({ message: 'This student has already been emailed for this program' });
      }

      const promotion = await createProgramPromotion({
        prisma: req.prisma,
        program,
        student,
        adminId: req.currentUser.id,
        matchScore,
        matchReasons,
      });

      return res.status(201).json(promotion);
    } catch (sendError) {
      return res.status(sendError.statusCode || 502).json({
        message: sendError.message || 'Failed to send promotion email',
        promotion: sendError.promotion,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send promotion email' });
  }
});

module.exports = router;
