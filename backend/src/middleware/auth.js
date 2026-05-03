const { clerkClient, getAuth } = require('@clerk/express');

function requireApiAuth(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  req.clerkUserId = userId;
  return next();
}

async function getOrCreateCurrentUser(req) {
  const { userId } = getAuth(req);

  if (!userId) return null;

  const clerkUser = await clerkClient.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress || `${userId}@clerk.local`;

  return req.prisma.user.upsert({
    where: {
      clerkId: userId,
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
  });
}

module.exports = {
  getOrCreateCurrentUser,
  requireApiAuth,
};
