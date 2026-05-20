# JalRakshak 🌊

Crowdsourced platform to map dirty water bodies in Indian cities and organize cleanup drives.

## Deploy in 10 minutes

### 1. Supabase Setup (you already did this)
- Project URL: `https://uvisjjhbpdlllzrrztkm.supabase.co`
- Go to **SQL Editor** → paste `schema.sql` → Run
- Then paste `seed.sql` → Run (seeds ~50 Delhi water bodies)
- Storage bucket `Photos` with public SELECT+INSERT policies ✓

### 2. Deploy to Vercel
```bash
# Push to GitHub
git init && git add -A && git commit -m "initial"
gh repo create jal-rakshak --public --push

# Deploy
# Go to vercel.com → Import → select repo
```

### 3. Environment Variables (set in Vercel dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=https://uvisjjhbpdlllzrrztkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
ADMIN_PASSWORD=your_secret_password
```

### 4. Add More Cities
Go to `yoursite.com/admin` → enter password → type city name → Fetch → Import.

## Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Architecture
- **Next.js 14** (App Router)
- **Supabase** (Postgres + Storage)
- **Leaflet** (maps)
- **No auth** — anonymous reports, WhatsApp for coordination

## Pages
- `/` — Map with colored pins (green/red/grey), city selector, filters
- `/water-body/[id]` — Detail page, report form, event form, photo gallery
- `/events` — All upcoming cleanup drives
- `/admin` — Password-protected admin to add cities via OSM
