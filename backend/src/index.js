require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const programRoutes = require('./routes/programs');

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

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'GlobalPath Education API is running',
  });
});

app.use('/api/programs', programRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});