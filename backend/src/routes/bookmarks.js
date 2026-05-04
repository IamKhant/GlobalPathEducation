const express = require('express');
const { getOrCreateCurrentUser, requireApiAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireApiAuth);

router.get('/', async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);

    const bookmarks = await req.prisma.bookmark.findMany({
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

    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch bookmarks',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);
    const programId = Number.parseInt(req.body.programId, 10);

    if (!programId) {
      return res.status(400).json({
        message: 'programId is required',
      });
    }

    const bookmark = await req.prisma.bookmark.upsert({
      where: {
        userId_programId: {
          userId: user.id,
          programId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        programId,
      },
      include: {
        program: true,
      },
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to save bookmark',
    });
  }
});

router.delete('/:programId', async (req, res) => {
  try {
    const user = await getOrCreateCurrentUser(req);
    const programId = Number.parseInt(req.params.programId, 10);

    await req.prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        programId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to remove bookmark',
    });
  }
});

module.exports = router;
