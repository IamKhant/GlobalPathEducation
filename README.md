# GlobalPath Education

An education agency web application for students to explore and compare IT programs worldwide. Built with Vue 3 + Bootstrap 5 (frontend) and Express + Prisma + Supabase (backend), with Clerk for authentication.

## Project Structure

```
GlobalPathEducation/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB models: Program, User, Bookmark, Consultation
│   │   └── seed.js             # 48 programs seeded from spreadsheet
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
        ├── router/index.js     # 9 routes (2 protected by auth)
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

## Pages (8 required for assignment)

| # | Page | Route | Auth |
|---|------|--------|------|
| 1 | Landing/Home | `/` | Public |
| 2 | Program Listing | `/programs` | Public |
| 3 | Program Detail | `/programs/:id` | Public |
| 4 | Compare Programs | `/compare` | Public |
| 5 | Saved Programs | `/bookmarks` | ✅ Required |
| 6 | Consultation Booking | `/consult` | Public |
| 7 | User Dashboard | `/dashboard` | ✅ Required |
| 8 | Sign In / Sign Up | `/sign-in`, `/sign-up` | Public |

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
npm run seed                # Loads all 48 programs
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

## Program Data

48 programs across 8 countries:
- **Australia** (20) — University of Melbourne, Sydney, Monash, ANU, UNSW, UQ, UTS, TAFE NSW, General Assembly, Le Wagon, and more
- **Canada** (7) — UBC, University of Waterloo, Toronto Metropolitan, Ontario Tech, Memorial University
- **Germany** (4) — TU Munich, RWTH Aachen, University of Augsburg, Frankfurt School
- **Ireland** (5) — University of Galway, UCD, UCC, University of Limerick, Munster Tech
- **Japan** (3) — Kyoto University, Waseda University, University of Tsukuba
- **Netherlands** (1) — Utrecht University
- **New Zealand** (2) — University of Auckland, University of Waikato
- **Spain** (1) — UPC Barcelona

Program types: Masters degrees and Bootcamps


## Credit to owners of the original spreadsheet data, and to the
currency API from - https://frankfurter.dev/
