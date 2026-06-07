# GlobalPath Education

An education agency web application for students to explore and compare IT programs worldwide. Built with Vue 3 + Bootstrap 5 (frontend) and Express + Prisma + Supabase (backend), with Clerk for authentication, DeepL translation, Frankfurter currency conversion, and Resend-powered program promotion emails.

## Project Structure

```
GlobalPathEducation/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB models: Program, User, Bookmark, Consultation, Promotion
│   │   └── seed.js             # 59 programs seeded from spreadsheet data
│   └── src/
│       ├── index.js            # Express app entry
│       ├── middleware/
│       │   └── auth.js         # Clerk JWT verification
│       └── routes/
│           ├── programs.js     # GET /api/programs (search + filter + paginate)
│           ├── bookmarks.js    # CRUD bookmarks (auth required)
│           ├── consultations.js# Book & list consultations (auth required)
│           └── users.js        # Clerk user sync
└── frontend/
    └── src/
        ├── api/index.js        # Axios with Clerk token interceptor
        ├── assets/main.css     # Global design system (CSS variables)
        ├── components/
        │   ├── AppNavbar.vue   # Responsive navbar with auth state
        │   ├── AppFooter.vue
        │   ├── ProgramCard.vue # Reusable card: bookmark + compare + navigate
        │   └── CompareBar.vue  # Sticky bottom compare bar
        ├── stores/
        │   ├── programs.js     # Pinia: program list, filters, pagination
        │   └── user.js         # Pinia: bookmarks, compare list
        ├── router/index.js     # 22 routes with public, student, consultant, and admin areas
        └── views/
            ├── HomeView.vue         # Landing page with hero, search, featured
            ├── ProgramsView.vue     # Browse with sidebar filters + pagination
            ├── ProgramDetailView.vue# Full program info + actions
            ├── CompareView.vue      # Side-by-side comparison table
            ├── BookmarksView.vue    # Saved programs grid
            ├── ConsultView.vue      # Consultation booking form
            ├── DashboardView.vue    # User account, stats, history
            ├── SignInView.vue
            └── SignUpView.vue
```

## Main Website Pages

| # | Page | Route | Auth |
|---|------|--------|------|
| 1 | Landing/Home | `/` | Public |
| 2 | Program Listing | `/programs` | Public |
| 3 | Program Detail | `/programs/:id` | Public |
| 4 | Compare Programs | `/compare` | Public |
| 5 | Saved Programs | `/bookmarks` | ✅ Required |
| 6 | Consultation Booking | `/consult` | Public |
| 7 | User Dashboard | `/dashboard` | ✅ Required |
| 8 | Consultants Directory | `/consultants` | Public |
| 9 | Student Onboarding | `/onboarding` | Student |
| 10 | Profile | `/profile` | Authenticated |
| 11 | Consultant Dashboard | `/consultant` | Consultant |
| 12 | Consultant Consultations | `/consultant/consultations` | Consultant |
| 13 | Consultant Students | `/consultant/students` | Consultant |
| 14 | Admin Dashboard | `/admin` | Admin |
| 15 | Admin Programs | `/admin/programs` | Admin |
| 16 | Admin Homepage | `/admin/homepage` | Admin |
| 17 | Admin Consultations | `/admin/consultations` | Admin |
| 18 | Admin Students | `/admin/students` | Admin |
| 19 | Admin Consultants | `/admin/consultants` | Admin |
| 20 | Admin Admins | `/admin/admins` | Admin |
| 21 | Sign In | `/sign-in` | Public |
| 22 | Sign Up | `/sign-up` | Public |

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (use Supabase)
- Clerk account (https://clerk.com)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment variables

**Backend** — copy `.env.example` to `.env`:
```
DATABASE_URL="postgresql://..."   # From Supabase → Settings → Database
CLERK_SECRET_KEY="sk_test_..."    # From Clerk dashboard
DEEPL_API_KEY="..."               # Backend-only translation key
RESEND_API_KEY="..."              # Backend-only email key
EMAIL_FROM="GlobalPath Education <onboarding@resend.dev>"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**Frontend** — create `.env`:
```
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."   # From Clerk dashboard
VITE_API_BASE_URL="http://localhost:3000"
```

### 3. Database setup

```bash
cd backend
npx prisma generate
npx prisma db push          # Creates tables in Supabase
npm run seed                # Loads the program dataset
```

### 4. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend  
cd frontend && npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/programs` | - | List programs (search, filter, paginate) |
| GET | `/api/programs/meta` | - | Filter options (countries, types) |
| GET | `/api/programs/:id` | - | Single program |
| GET | `/api/bookmarks` | ✅ | User's bookmarks |
| POST | `/api/bookmarks` | ✅ | Add bookmark |
| DELETE | `/api/bookmarks/:programId` | ✅ | Remove bookmark |
| GET | `/api/consultations` | ✅ | User's consultations |
| POST | `/api/consultations` | ✅ | Book consultation |
| PATCH | `/api/consultations/:id/cancel` | ✅ | Cancel consultation |
| POST | `/api/users/sync` | ✅ | Sync Clerk user to DB |
| GET | `/api/users/me` | ✅ | Get current user |
| PATCH | `/api/users/me` | ✅ | Update onboarding/profile data |
| POST | `/api/translations/ui` | - | Translate and cache UI text through DeepL |
| POST | `/api/programs/:id/translation` | - | Translate and cache program content through DeepL |
| GET | `/api/admin/dashboard` | Admin | Admin statistics and recent activity |
| POST | `/api/admin/programs` | Admin | Create program and trigger matched-student promotions |
| PATCH | `/api/admin/programs/:id` | Admin | Update program and trigger matched-student promotions |
| POST | `/api/admin/program-promotions/send` | Admin | Manually send promotion email through Resend |

## Program Data

59 programs across 9 countries:
- **Australia**
- **Canada**
- **Germany**
- **Ireland**
- **Japan**
- **Malaysia**
- **Netherlands**
- **New Zealand**
- **Spain**

Program types: Bachelor, Diploma, Master, and Bootcamp.

## Advanced Features

- First-time student onboarding collects destination, study level, budget, and profile details before opening the dashboard.
- The dashboard suggests programs using the student's onboarding profile and shows match percentages with reasons.
- Admin program creation and updates automatically email students whose match score is above 80%.
- Admins can manually email lower-score matches from the promotion panel.
- Resend sends promotion emails and stores provider status in the database.
- DeepL translations are requested through backend routes and cached in the database for faster repeated use.
- Frankfurter exchange rates support live tuition currency conversion.

## Deployment

- Frontend: Vercel
- Backend API: Render
- Database: Supabase PostgreSQL
- Authentication: Clerk
- Email: Resend
- Translation: DeepL


## Credits

Credit to the owners of the original spreadsheet data and to the Frankfurter currency API: https://frankfurter.dev/
