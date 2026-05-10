require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const bookmarkRoutes = require('./routes/bookmarks');
const adminRoutes = require('./routes/admin');
const consultationRoutes = require('./routes/consultations');
const consultantsRoutes = require('./routes/consultants');
const consultantRoutes = require('./routes/consultant');
const programRoutes = require('./routes/programs');
const userRoutes = require('./routes/users');
const translationRoutes = require('./routes/translations');

const app = express();
const PORT = process.env.PORT || 3000;

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(clerkMiddleware());

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'GlobalPath Education API is running',
  });
});

app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/consultants', consultantsRoutes);
app.use('/api/consultant', consultantRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);
app.use('/api/translations', translationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
