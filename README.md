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
│           ├── consultations.js# Book & list consultations
│           ├── admin.js        # Admin dashboards, program management, promotions
│           ├── consultant.js   # Consultant dashboards and assigned consultations
│           ├── translations.js # DeepL-backed UI translation cache
│           └── users.js        # Current user profile and onboarding data
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
            ├── DashboardView.vue    # Student recommendations, stats, history
            ├── OnboardingView.vue   # First-time student profile capture
            ├── AdminProgramsView.vue# Admin program CRUD and promotion workflow
            ├── ConsultantView.vue   # Consultant role dashboard
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

## Local Setup and Run

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm
- PostgreSQL database. This project uses Supabase PostgreSQL.
- Clerk account for authentication.
- DeepL API key for translation.
- Resend API key for promotion emails.

> `node_modules` is not included in the submitted project. Run `npm install` in both `backend` and `frontend` before starting the app.

The commands below assume you are starting from the project root folder, `GlobalPathEducation`.

### 1. Open the project

```bash
cd GlobalPathEducation
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
cd ..
```

### 3. Create environment files

Create the backend `.env` file:

```bash
cd backend
cp .env.example .env
cd ..
```

Edit `backend/.env`:

```env
DIRECT_URL="postgresql://user:password@host:5432/database"
DATABASE_URL="postgresql://user:password@host:5432/database"
FRONTEND_URL="http://localhost:5173"
CLERK_SECRET_KEY="sk_test_your_key_here"
DEEPL_API_KEY="your_deepl_key_here"
DEEPL_API_URL="https://api-free.deepl.com/v2"
RESEND_API_KEY="your_resend_key_here"
EMAIL_FROM="GlobalPath Education <onboarding@resend.dev>"
```

Create the frontend `.env` file:

```bash
cd frontend
cp .env.example .env
cd ..
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
VITE_FRANKFURTER_API_URL="https://api.frankfurter.dev"
```

Environment notes:
- `DIRECT_URL` and `DATABASE_URL` come from Supabase.
- `CLERK_SECRET_KEY`, `DEEPL_API_KEY`, and `RESEND_API_KEY` must stay in `backend/.env`.
- `VITE_CLERK_PUBLISHABLE_KEY` is the only Clerk key used by the frontend.
- For local testing, keep `FRONTEND_URL` as `http://localhost:5173`.

### 4. Set up the database

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
cd ..
```

This creates the database tables and loads the program dataset.

If you need the extra Bachelor/Diploma sample programs, also run:

```bash
cd backend
npm run seed:extra-programs
cd ..
```

### 5. Run the backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend should run at:

```text
http://localhost:3000
```

You can test it by opening:

```text
http://localhost:3000
```

Expected response:

```json
{
  "message": "GlobalPath Education API is running"
}
```

### 6. Run the frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

### 7. Local demo accounts

These accounts must exist in your Clerk instance. If they do not exist yet, create them in Clerk or sign up with those emails.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@globalpath.com` | `iamadmin` |
| Consultant | `auconsultant@globalpath.com` | `consultant` |
| Consultant | `euconsultant@globalpath.com` | `consultant` |
| Consultant | `asianconsultant@globalpath.com` | `consultant` |
| Student | `studentone@globalpath.com` to `studentten@globalpath.com` | `student` |

After a user signs in for the first time, the backend creates the user record in Supabase. To test admin or consultant pages, make sure the user's `role` column in the `users` table is set correctly:

```text
admin
consultant
student
```

### 8. Common local issues

- If the frontend loads but API data is missing, check that the backend is running on `http://localhost:3000`.
- If authenticated API calls fail, check that the frontend and backend are using Clerk keys from the same Clerk environment.
- If the browser blocks backend requests, check `FRONTEND_URL` in `backend/.env`.
- If translation does not work, check `DEEPL_API_KEY` and `DEEPL_API_URL`.
- If promotion emails do not send, check `RESEND_API_KEY` and `EMAIL_FROM`.
- If Prisma cannot connect, check `DIRECT_URL` and `DATABASE_URL`.

## Main API Endpoints

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
| GET | `/api/users/me` | ✅ | Get current user |
| PATCH | `/api/users/me` | ✅ | Update onboarding/profile data |
| POST | `/api/translations/ui` | - | Translate and cache UI text through DeepL |
| GET | `/api/programs/:id/translation` | - | Fetch cached program translation |
| POST | `/api/programs/:id/translation` | - | Translate and cache program content through DeepL |
| GET | `/api/consultants` | - | List public consultant directory |
| GET | `/api/consultant/dashboard` | Consultant | Consultant statistics and assigned work |
| GET | `/api/consultant/consultations` | Consultant | Consultant consultation queue |
| PATCH | `/api/consultant/consultations/:id/status` | Consultant | Update assigned consultation status |
| GET | `/api/consultant/students` | Consultant | View assigned student records |
| GET | `/api/admin/dashboard` | Admin | Admin statistics and recent activity |
| GET | `/api/admin/programs` | Admin | List programs for administration |
| POST | `/api/admin/programs` | Admin | Create program and trigger matched-student promotions |
| PATCH | `/api/admin/programs/:id` | Admin | Update program and trigger matched-student promotions |
| DELETE | `/api/admin/programs/:id` | Admin | Delete a program |
| GET | `/api/admin/consultations` | Admin | Manage consultation records |
| PATCH | `/api/admin/consultations/:id` | Admin | Update consultation status or assignment |
| GET | `/api/admin/students` | Admin | List student records |
| GET | `/api/admin/consultants` | Admin | List consultant records |
| GET | `/api/admin/admins` | Admin | List admin records |
| PATCH | `/api/admin/users/:id/role` | Admin | Update user role |
| PATCH | `/api/admin/ui-text` | Admin | Update cached UI text |
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

### Image Credits

- Hero study-abroad image: https://www.magnific.com/free-ai-image/3d-icon-traveling-vacation_151973479.htm
- Australia image: Tyler Duston on Unsplash, https://unsplash.com/photos/sydney-opera-house-ZXlfq5mExMs
- Germany image: Ansgar Scheffold on Unsplash, https://unsplash.com/photos/brown-concrete-gateway-during-daytime-mtfTz0FnwBw
- Canada image: Alex Shutin on Unsplash, https://unsplash.com/photos/city-view-during-nighttime-photography-uhn-U0sSxFQ
- Ireland image: Jason Murphy on Unsplash, https://unsplash.com/photos/white-and-black-concrete-building-under-blue-sky-during-daytime-rTG1TR6Ygb0
- New Zealand image: Mitchell Henderson on Pexels, https://www.pexels.com/photo/snowcapped-mountain-range-seen-from-lake-shore-18374798/
- Japan image: Nguyen Khac Tien on Pexels, https://www.pexels.com/photo/red-and-green-pagoda-temple-near-trees-and-mountain-12542838/
- Spain image: Archie McNicol on Pexels, https://www.pexels.com/photo/an-aerial-view-of-barcelona-spain-18602894/
- Netherlands image: Sevda Ozdemir on Pexels, https://www.pexels.com/photo/colorful-wooden-houses-on-piers-of-reitdiephaven-in-groningen-10795818/
