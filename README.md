# ClipMitra AI — Phase 1 (Foundation)

Ye **Phase 1** hai poore ClipMitra AI SaaS product ka: authentication, dashboard, aur project creation ka working base. Real AI video processing (Phase 3) abhi implement nahi hui hai — wo agla step hai.

## Abhi kya kaam karta hai ✅

- Email/password signup + login (NextAuth + bcrypt)
- Protected dashboard (`/dashboard`) jo sirf logged-in user ko dikhta hai
- Project creation form (`/projects/new`) — language + content type select karna
- Database schema (Prisma) — Users, Projects, Videos, Clips, Captions
- Har user sirf apne khud ke projects dekh sakta hai (auth-scoped queries)

## Abhi kya "Coming Soon" hai ⏳

- **Video upload** — `app/api/upload/route.ts` mein clearly mark kiya hai "Requires configuration". Isko real banane ke liye object storage (S3/R2/Vercel Blob) chahiye.
- Speech-to-text, AI clip detection, caption/hook generation — ye Phase 3 mein aayega
- 9:16 reel export, subtitles — Phase 5

Koi bhi feature fake data nahi dikhata — jo implement nahi hua, wo clearly "Requires configuration" bolta hai.

## Setup karne ka tarika

### 1. Dependencies install karein

```bash
cd clipmitra-ai
npm install
```

### 2. Environment variables set karein

```bash
cp .env.example .env
```

Phir `.env` file kholke ye fill karein:

- `DATABASE_URL` — ek free PostgreSQL database banayein [Neon](https://neon.tech) ya [Supabase](https://supabase.com) pe, aur connection string yahan daalein
- `NEXTAUTH_SECRET` — terminal mein ye chalayein aur output paste karein:
  ```bash
  openssl rand -base64 32
  ```

### 3. Database schema push karein

```bash
npm run db:push
```

Ye Prisma schema (`prisma/schema.prisma`) ke hisaab se tables bana dega.

### 4. Dev server chalayein

```bash
npm run dev
```

Browser mein kholein: **http://localhost:3000**

## Test kaise karein

1. `/signup` pe jaakar ek account banayein
2. `/login` se login karein
3. `/dashboard` pe redirect ho jayenge
4. "+ Naya Project" click karke ek project banayein (language + content type chunein)
5. Video file select karne ki koshish karein — aapko "Requires configuration" message dikhega, ye expected hai (storage abhi setup nahi hai)

## Aage kya (Phase 2 se 6 tak)

1. Object storage integrate karna (real video upload)
2. Background job queue (BullMQ + Redis) processing ke liye
3. FFmpeg se audio extract + Whisper se transcription
4. AI (Claude/OpenAI) se best-moment scoring
5. Caption/hook/hashtag generation
6. 9:16 reel export + subtitles
7. Thumbnail generator
8. Content calendar + analytics

Har phase pichhle README workflow (jo aapne pehle diya tha) ke order mein banega.

## Project structure

```
clipmitra-ai/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── signup/route.ts               # User registration
│   │   ├── projects/route.ts             # List/create projects
│   │   └── upload/route.ts               # Video upload (needs storage config)
│   ├── dashboard/page.tsx                # Protected dashboard
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── projects/new/page.tsx             # Create project + upload UI
│   ├── layout.tsx
│   └── page.tsx                          # Landing page
├── lib/
│   ├── auth.ts                           # NextAuth config
│   └── prisma.ts                         # DB client
├── prisma/
│   └── schema.prisma                     # Database schema
├── types/next-auth.d.ts
└── .env.example
```
