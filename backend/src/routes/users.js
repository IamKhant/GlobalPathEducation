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

    if (dateOfBirth === undefined) {
      return res.status(400).json({
        message: 'Invalid date of birth',
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
