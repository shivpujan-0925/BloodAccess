# BloodAccess 🩸

> **Right blood. Right time. Right nearby.**  
> A privacy-first, community-driven voluntary blood donor matching platform for India.

---

## 🌟 Key Features

- **Strictly Voluntary & Non-Commercial:** 100% free forever. In strict adherence to the Drugs and Cosmetics Act (1940) and Supreme Court precedent (*Common Cause vs. Union of India, 1996*), selling or buying blood is prohibited.
- **Privacy by Architecture:**
  - Donor phone numbers are **never visible** in public search results.
  - Search reads exclusively from an isolated database view (`public_donors`) exposing only first names and last initials (e.g. *Ramesh K.*).
  - Phone numbers are revealed only through a secure server-side RPC function (`reveal_contact`) after the emergency requester completes 6-digit SMS OTP verification.
  - Anti-spam safeguard: Maximum 5 contact reveals per 24 hours per requester.
- **Automated Medical Cooldowns:** When a donation is logged, resting cooldowns are automatically applied (90 days for men, 120 days for women per NBTC clinical guidelines).
- **Self-Service DPDP Act Compliance:** Donors retain full autonomy with a 1-tap **"Delete My Account and Data"** button on their dashboard for instant, irreversible database erasure.
- **Anti-Misuse Reporting:** 1-tap report button on donor cards with automated suspension on 3 verified misuse reports.
- **Protected Admin & Moderation Portal (`/admin`):** Donor management, verification badge grants, suspension controls, misuse queue, and CSV exports.
- **Bilingual Support:** Full English and Hindi (`हिन्दी`) language toggle across all pages.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Custom medical palette: Primary `#D32F2F`, Deep `#B71C1C`, Soft `#FBEFEF`)
- **Routing:** React Router DOM v7
- **Internationalization:** i18next + react-i18next
- **Forms & Validation:** react-hook-form
- **Icons:** Lucide React
- **Backend / Database:** Supabase (PostgreSQL with Row Level Security & PL/pgSQL RPCs)
- **Deployment:** Vercel (configured with `vercel.json` SPA rewrites)

---

## 📁 Project Structure

```
BloodAccess/
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules (strictly excludes .env)
├── vercel.json           # Vercel SPA rewrite configuration
├── index.html            # HTML entry point with Poppins typography
├── vite.config.js        # Vite + Tailwind configuration
├── supabase/
│   └── schema.sql        # Database schema, views, RLS policies & RPC functions
└── src/
    ├── App.jsx           # Main router & page routes
    ├── index.css         # Tailwind CSS v4 & custom design tokens
    ├── components/
    │   ├── Header.jsx           # Navigation bar with language switcher
    │   ├── Footer.jsx           # Legal & ethical disclaimers + sitemap
    │   ├── ContactDonorModal.jsx# OTP verification & reveal_contact RPC
    │   └── ReportModal.jsx      # Misuse reporting modal
    ├── pages/
    │   ├── HomePage.jsx         # Hero, quick search, impact strip, FAQ
    │   ├── FindBloodPage.jsx    # Filterable donor search & cards
    │   ├── RegisterPage.jsx     # 3-step donor registration with OTP
    │   ├── DashboardPage.jsx    # Availability toggle, cooldown & deletion
    │   ├── LoginPage.jsx        # Passwordless phone OTP login
    │   ├── AdminPage.jsx        # Protected moderation & safety portal
    │   ├── HowItWorksPage.jsx   # Dual-role visual workflow explainer
    │   ├── PrivacyPage.jsx      # Plain-language DPDP Act 2023 policy
    │   ├── TermsPage.jsx        # Terms of Service & ethical code
    │   └── ContactPage.jsx      # Volunteer coordination & grievance desk
    ├── lib/
    │   └── supabaseClient.js    # Initialized Supabase client
    └── i18n/
        └── locales/
            ├── en.json          # English translation strings
            └── hi.json          # Hindi translation strings
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- A free [Supabase](https://supabase.com) account

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_PASSCODE=your-secret-admin-passcode
```

### 4. Setup Database
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment (Vercel)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BloodAccess platform"
   git remote add origin https://github.com/YOUR_USERNAME/BloodAccess.git
   git push -u origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. Set the Framework Preset to **Vite**.
4. In **Project Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSCODE`
5. Click **Deploy**.

---

## ⚖️ Legal & Medical Disclaimer

*BloodAccess is a voluntary technology platform connecting willing donors with patients in urgent need. BloodAccess is not a blood bank, hospital, pathology laboratory, or clinical establishment. We do not store, test, or collect blood. In life-threatening emergencies, families must immediately alert their hospital blood bank and coordinate with district healthcare authorities.*
