const express = require('express');
const { getOrCreateCurrentUser, requireApiAuth } = require('../middleware/auth');

const router = express.Router();

function normalizeText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

function normalizeNumber(value) {
  if (value === '' || value == null) return null;

  const number = Number.parseFloat(value);
  if (Number.isNaN(number) || number < 0) return undefined;

  return number;
}

router.get('/me', requireApiAuth, async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to load profile',
    });
  }
});

router.patch('/me', requireApiAuth, async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);
    const dateOfBirth = normalizeDate(req.body.dateOfBirth);
    const maxBudget = normalizeNumber(req.body.maxBudget);

    if (dateOfBirth === undefined) {
      return res.status(400).json({
        message: 'Invalid date of birth',
      });
    }

    if (maxBudget === undefined) {
      return res.status(400).json({
        message: 'Invalid budget amount',
      });
    }

    const data = {
      firstName: normalizeText(req.body.firstName),
      lastName: normalizeText(req.body.lastName),
      phone: normalizeText(req.body.phone),
      nationality: normalizeText(req.body.nationality),
      dateOfBirth,
      currentEducationLevel: normalizeText(req.body.currentEducationLevel),
      preferredStudyLevel: normalizeText(req.body.preferredStudyLevel),
      preferredDestination: normalizeText(req.body.preferredDestination),
      maxBudget,
      budgetCurrency: normalizeText(req.body.budgetCurrency)?.toUpperCase() || null,
    };

    if (user.role === 'consultant') {
      data.consultantBio = normalizeText(req.body.consultantBio);
    }

    const updatedUser = await req.prisma.user.update({
      where: {
        id: user.id,
      },
      data,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update profile',
    });
  }
});

module.exports = router;
