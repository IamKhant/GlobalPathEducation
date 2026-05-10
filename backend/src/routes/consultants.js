const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const consultants = await req.prisma.user.findMany({
      where: {
        role: 'consultant',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        consultantBio: true,
        profileImageUrl: true,
        consultantCountries: {
          select: {
            country: true,
          },
          orderBy: {
            country: 'asc',
          },
        },
      },
      orderBy: [
        {
          firstName: 'asc',
        },
        {
          lastName: 'asc',
        },
      ],
    });

    res.json(consultants);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch consultants',
    });
  }
});

module.exports = router;
