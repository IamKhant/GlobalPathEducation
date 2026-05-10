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
      profileImageUrl: clerkUser.imageUrl || null,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      profileImageUrl: clerkUser.imageUrl || null,
    },
  });
}

function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      const user = await getOrCreateCurrentUser(req);

      if (!user) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: 'Forbidden',
        });
      }

      req.currentUser = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Failed to verify role',
      });
    }
  };
}

const requireConsultantOrAdmin = requireRole(['consultant', 'admin']);
const requireConsultant = requireRole('consultant');
const requireAdmin = requireRole('admin');

module.exports = {
  getOrCreateCurrentUser,
  requireApiAuth,
  requireAdmin,
  requireConsultant,
  requireConsultantOrAdmin,
  requireRole,
};
