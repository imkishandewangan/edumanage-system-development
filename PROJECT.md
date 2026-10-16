# EduManage project guide

EduManage is a browser-based institution management system for schools, colleges, tuition centres and coaching institutes. The project uses the supplied Education Management System Design as its product direction. The companion future-scope document lists optional paid integrations; they are not part of the local application setup.

## Run locally

Requirements: Node.js 20 or later and pnpm 12.

```powershell
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Open the web app at `http://localhost:5173`. The API runs at `http://localhost:3000/api/v1`; its health check is `/api/v1/health` and its API reference is `/docs`.

The seed creates the first local institution and administrator:

- Email: `super@demo.local`
- Password: `Demo@12345`

The default SQLite database is `data/edumanage.db`. Keep this file and make backups: it contains the institution's saved records. Set `DATABASE_URL` to use another local SQLite file. Change the development JWT secrets before exposing the API outside the local machine.

## Current working features

- Sign in, access tokens, refresh tokens, sign out, role permissions and institution-scoped API access.
- Create and browse enquiries, including name, phone, course, source, status and generated enquiry number.
- Create and browse students, including name, phone, status and generated admission number.
- Create and browse courses.
- Record student payments in minor currency units with payment mode and stored payment history.
- Mark and browse per-student daily attendance (present, absent, late or leave); re-saving a date updates that day's mark.
- Search the records currently shown in the Enquiries and Students workspaces.
- Live dashboard totals for saved students, enquiries and monthly payment records.
- Institution details, module switches, master lists, number formats and academic-year settings.
- Local SQLite persistence through Prisma. Records remain available after restarting the app.

The Fees, Academics and Attendance navigation items are currently workspace placeholders. They must not be treated as implemented record workflows yet. Dashboard totals reflect saved database records; absent payment and attendance records are shown as zero or omitted rather than filled with sample figures.

## Product roadmap from the design

1. **Core operations:** finish fee plans, instalments and printable receipts; add classes, sections, batches, subjects and batch attendance registers.
2. **Admissions and administration:** enquiry conversion, applications, imports, student and guardian details, staff, branches, timetable and certificates.
3. **Configurable institution platform:** custom fields and forms, validation, approval and workflow rules, configurable reports, roles and audit history.
4. **Broader education features:** examinations and gradebook, parent/student web access, lesson schedules, leave, notices, document tracking and printable registers.
5. **Internationalisation and operations:** institution-specific currency and tax settings, language support, exports, backups and self-hosted deployment guidance.

The implementation should keep institution data separated on every read and write, validate submissions in the API, and show stored data rather than illustrative counts. Future-scope integrations should only be added when their service, account and operating costs are intentionally accepted.

## Project layout

- `apps/web`: the browser application (Vite + React).
- `apps/api`: the HTTP API (NestJS) and database access.
- `packages/shared`: schemas shared by the browser and API.
- `prisma`: database schema, migrations and initial local setup.
- `PROJECT.md`: this implementation guide and feature status.

For production, configure strong secrets, restrict CORS to the actual web origin, use a durable backed-up database location, and run behind HTTPS. The default configuration is intended for local development.
