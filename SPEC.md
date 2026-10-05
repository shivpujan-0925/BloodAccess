# BloodAccess: Complete Website Spec (UI + Functionality)

Use this document as the source of truth in Antigravity. Build in the phases listed at the end, one phase at a time.

---

## 1. What we are building

**BloodAccess** is a free website where voluntary blood donors register once, and anyone who needs blood in an emergency can search by blood group and city to reach available donors in minutes.

**Core promise:** Right blood. Right time. Right nearby.

**Rules that never change:**
- The service is **always free** for donors and requesters. No payments, no selling blood, no "priority" paid access for patients.
- Donor phone numbers are **never public**. They are revealed only after the requester verifies their own phone with OTP.
- Mobile-first. Most users will open this from a WhatsApp link in an emergency, on a mid-range Android phone with slow internet.
- Hindi and English from day one.

---

## 2. Suggested tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Vite + React (JavaScript, no TypeScript)** + Tailwind CSS | Simple setup, fast dev, easy for beginners |
| Routing | react-router-dom | Page navigation |
| Backend + DB | Supabase (Postgres, Auth, Row Level Security) via `@supabase/supabase-js` | Free tier, built-in auth and security |
| OTP | Supabase Phone Auth, with MSG91 or Twilio as SMS provider | OTP for donors and requesters |
| Hosting | Vercel or Netlify (static deploy) | Free tier, one-click deploy |
| i18n | react-i18next | Hindi + English toggle |
| Forms | react-hook-form | Multi-step forms with validation |
| Icons | lucide-react | Clean icons |
| Maps (later) | Leaflet + OpenStreetMap | Free, no billing |

Keep it simple: no custom backend server for the MVP. Use Supabase database functions (RPC) and Row Level Security. Plain React runs in the browser, so city SEO pages (e.g. `/blood-donors/patna`) are a Phase 2 item: add pre-rendering or move only those pages to a static generator later.

---

## 3. Design system (UI)

**Feel:** Calm, trustworthy, urgent but not scary. Think "health NGO + modern startup", not "hospital brochure".

**Colors**
- Primary red: `#D32F2F` (buttons, key highlights)
- Deep red: `#B71C1C` (hero, headers, hover)
- Soft red tint: `#FBEFEF` (card backgrounds)
- Dark text: `#222222`
- Grey text: `#616161`
- White background: `#FFFFFF`
- Success green: `#2E7D32` (available, verified)
- Warning amber: `#F9A825` (pending, cooldown)

Use red sparingly. White space and clear text do most of the work.

**Typography:** Poppins or Inter. Headings bold, body 16px minimum (important for older users). Hindi font: Noto Sans Devanagari.

**Components:** rounded corners (12px), soft shadows, large tap targets (min 48px height), clear focus states, blood-group chips (A+, A-, B+, B-, AB+, AB-, O+, O-) as big selectable pills.

**Accessibility:** WCAG AA contrast, labels on all inputs, keyboard friendly, no information by color alone (always add text like "Available").

**Tone of copy:** Short, plain, human. Example: "Need blood urgently? Search donors near you."

---

## 4. Pages and UI layout

### 4.1 Home page (`/`)
1. **Top bar:** logo "BloodAccess" (red drop icon + text), links: Find Blood, Become a Donor, How it works, language toggle (EN | हिं), Login.
2. **Hero (deep red background):**
   - Headline: "Find a blood donor in minutes."
   - Subtext: "Free. Verified. Nearby."
   - **Quick search card** (white, on top of hero): blood group chips + city dropdown + big "Search donors" button.
   - Secondary button: "Become a donor".
3. **Live impact strip:** 3 counters: Donors registered, Requests solved, Cities covered (start with real numbers only, hide if zero).
4. **How it works:** 3 steps with icons: Register → Search → Connect.
5. **Why trust us:** privacy-first (numbers hidden), OTP verified, free forever, donor controls their availability.
6. **Partners strip:** logos of NGOs, colleges, blood banks (added later).
7. **Donor FAQ + Requester FAQ** (accordion).
8. **Footer:** About, Privacy Policy, Terms, Contact, Report misuse, social links. Add disclaimer: "BloodAccess connects volunteers. It does not sell or store blood. In emergencies, also contact your hospital's blood bank."

### 4.2 Find Blood page (`/find`)
- Left (or top on mobile): filters: blood group (chips), state, city/district, area (optional), "Available now" toggle.
- Results as cards, sorted by: available now first, then last donated (oldest first), then nearest area.
- **Donor card shows:** first name + last initial (e.g. "Ramesh K."), blood group badge, city + area, availability badge (green "Available" or amber "Available from 12 Dec"), last donated month and year, verified badge if verified.
- **Never shown on card:** phone number, full name, exact address.
- Button on each card: **"Contact donor"**.
- Empty state: "No donors found nearby. Try nearby cities or send an SOS request" with a button for SOS (see 4.4).

### 4.3 Contact flow (modal or page)
1. Requester taps "Contact donor".
2. Modal asks: requester name, phone number, patient blood group, hospital name and city, urgency (Urgent today / Within 3 days / Planned).
3. Requester receives **OTP** by SMS, enters it.
4. After OTP success: show donor's **Call** and **WhatsApp** buttons (WhatsApp opens with a prefilled message: "Hi, I found you on BloodAccess. Need {group} blood at {hospital}, {city}. Can you help?").
5. Log the contact event (see database). Show a note: "Please be respectful. Donors are volunteers. Never ask or offer money."
6. After 24 hours, send requester an SMS or on-page prompt: "Did you get help? Yes / No". This feeds "Requests solved".

### 4.4 SOS request page (`/sos`)
For when search has no results or the need is critical:
- Form: patient blood group, units needed, hospital, city, contact phone (OTP verified), deadline.
- On submit: system notifies all matching **available** donors in that city (SMS or WhatsApp, using a template message with a link, no phone number shared).
- Donors reply by tapping "I can help" in the link, which then reveals the requester's number only to that donor.
- Each SOS has a public status page (`/sos/:id`): Open, Donors responded count, Closed.

### 4.5 Become a Donor / Register (`/register`)
Multi-step form (3 short steps, progress bar):
1. **Basics:** name, age (18 to 65), gender, phone (OTP verify).
2. **Blood details:** blood group, weight (above 45 kg check), last donation date (optional), any health conditions checklist (short, with "talk to a doctor if unsure").
3. **Location and consent:** state, city, area, preferred contact (call / WhatsApp / both), and **explicit consent checkboxes** (see section 7). Submit.
- On success: welcome screen with "You may save a life" message, a shareable card image (name, blood group, "I'm a BloodAccess donor") for WhatsApp and Instagram, and a link to the dashboard.
- Block registration if under 18, over 65, or under 45 kg, with a kind explanation.

### 4.6 Donor Dashboard (`/dashboard`)
- Big **availability toggle** (Available / Not available), the most important control.
- Status card: "Next eligible date: 14 Jan 2027" (auto-calculated).
- "Log a donation" button (date, place), which sets cooldown automatically.
- Contact history: "3 people contacted you" (no personal data beyond first name and request type).
- Edit profile, change city, change contact preference.
- **Delete my account and data** button (required by DPDP Act).
- Badges and certificate: "First donation", "3 donations", downloadable e-certificate (PDF).

### 4.7 Login (`/login`)
Phone number + OTP only. No passwords.

### 4.8 How it works (`/how-it-works`), About (`/about`), Privacy (`/privacy`), Terms (`/terms`), Contact (`/contact`)
Simple content pages. Privacy page must clearly explain what data is collected and how to delete it.

### 4.9 Admin panel (`/admin`, protected)
- Dashboard: donors count, requests, SOS open, reports.
- Donors table: search, verify, suspend, delete.
- Requests and SOS table with status.
- **Reports queue:** misuse reports on donors or requesters, with actions (warn, suspend).
- City and area master list management.
- Export CSV (admin only).

### 4.10 Phase 2 pages
- **Blood camps** (`/camps`): list upcoming camps by city, register for a slot.
- **Hospital / blood bank portal** (`/partner`): verified partners post requests, see donor counts, run camps, get dashboards (this is the paid SaaS layer later).

---

## 5. Functionality and business rules

**Donor eligibility**
- Age 18 to 65, weight at least 45 kg.
- After a donation, donor automatically becomes **Unavailable** until the cooldown ends. Make the gap configurable. Default: 90 days for men, 120 days for women. Verify this with NBTC guidelines or a doctor before launch.
- Donor can manually pause anytime.
- Show a gentle health disclaimer: final eligibility is decided by the blood bank or doctor at donation time.

**Search ranking**
1. Available now
2. Same city, then same area
3. Longest time since last donation
4. Verified donors above unverified

**Contact limits (anti-misuse)**
- A requester can reveal at most **5 donors per 24 hours** per phone number.
- A donor can be contacted by the same number only once per 24 hours.
- OTP: 6 digits, expires in 5 minutes, max 3 resends per hour, max 5 wrong attempts then lock for 30 minutes.
- Rate limit by IP and phone.
- Any user can **Report** a donor or requester (reasons: asked for money, fake, abusive, other). 3 reports means auto-suspend pending admin review.

**Verification levels**
- Level 0: phone OTP verified.
- Level 1 "Verified": admin or partner (NGO, college, blood bank) confirms the donor, or donor uploads proof of a past donation certificate (optional).

**Notifications**
- SMS (and WhatsApp later) for: OTP, SOS alerts to matching donors, "You can donate again" reminder, "Did you get help?" follow-up.
- Never send marketing messages without separate consent.

**Language**
- Whole site toggles between English and Hindi. Store the choice. Design the strings in a translation file from the start so more languages (Bhojpuri, Bengali, Tamil, etc.) can be added.

---

## 6. Database schema (Postgres / Supabase)

```
donors
  id uuid pk
  user_id uuid (auth)
  full_name text
  age int
  gender text
  phone text (private, never returned in public queries)
  blood_group text  -- A+, A-, B+, B-, AB+, AB-, O+, O-
  weight_kg int
  state text
  city text
  area text
  contact_pref text -- call | whatsapp | both
  is_available boolean default true
  last_donated_on date null
  next_eligible_on date null
  verification_level int default 0
  status text default 'active' -- active | suspended | deleted
  consent_version text
  consent_at timestamptz
  created_at timestamptz

requesters
  id uuid pk
  name text
  phone text
  phone_verified_at timestamptz

contact_events
  id uuid pk
  donor_id uuid fk
  requester_id uuid fk
  patient_blood_group text
  hospital text
  city text
  urgency text
  created_at timestamptz
  outcome text null -- helped | not_helped | no_response

sos_requests
  id uuid pk
  requester_id uuid fk
  blood_group text
  units int
  hospital text
  city text
  deadline timestamptz
  status text default 'open' -- open | fulfilled | closed
  created_at timestamptz

sos_responses
  id uuid pk
  sos_id uuid fk
  donor_id uuid fk
  responded_at timestamptz

donations_log
  id uuid pk
  donor_id uuid fk
  donated_on date
  place text

reports
  id uuid pk
  reported_type text -- donor | requester
  reported_id uuid
  reason text
  details text
  status text default 'open'
  created_at timestamptz

admins
  user_id uuid pk
  role text
```

**Row Level Security (important):**
- Public search reads only from a **view** `public_donors` that exposes: id, first name + last initial, blood_group, city, area, availability, last_donated month and year, verification_level. It must **never** include phone or full name.
- Phone numbers are returned only by a server-side function `reveal_contact(donor_id)` that checks: requester OTP verified, rate limits not exceeded, donor active and available. It logs a `contact_events` row each time.
- Donors can read and update only their own row.
- Admin role required for the admin tables.

---

## 7. Privacy, legal and consent (DPDP Act 2023)

- Show a clear **consent checkbox** at registration: "I agree to be contacted by people who need blood. My phone number is shown only after they verify their number." Store consent text version and timestamp.
- Separate optional checkbox for reminders and news.
- Privacy Policy in plain language (English and Hindi): what we collect, why, who sees it, how to delete.
- **Delete account and data** works instantly from the dashboard.
- Do not collect patient names or medical records. Ask only the patient's blood group and hospital.
- Do not share donor data with third parties (labs, insurers) without a separate explicit opt-in.
- Footer disclaimer: BloodAccess is a volunteer connection platform, not a medical service or blood bank.
- Encrypt data at rest (Supabase default), HTTPS only, no secrets in client code.

---

## 8. Non-functional requirements

- Page load under 3 seconds on 4G; Lighthouse performance 85+ on mobile.
- Works well on small screens (360px width) and low-end Android.
- Basic offline friendliness: cache static pages (PWA), "Add to home screen" prompt.
- SEO: city pages like `/blood-donors/patna` (generated), good titles and meta descriptions.
- Analytics: privacy-friendly (Plausible or similar), track searches, contacts revealed, SOS solved.
- Error states and loading skeletons on all data screens.

---

## 9. Build order (give Antigravity one phase at a time)

**Phase 1: MVP (build first)**
1. Vite + React project setup, Tailwind design system, header, footer, home page (static), language toggle (react-i18next).
2. Supabase setup, schema, RLS, `public_donors` view.
3. Donor registration (3 steps) with phone OTP and consent.
4. Find Blood page with filters and donor cards.
5. Contact flow with requester OTP and `reveal_contact` function, rate limits, event logging.
6. Donor dashboard: availability toggle, log donation, auto cooldown, delete account.
7. Report button and a simple admin table (donors, reports).
8. Privacy, Terms, How it works pages.

**Phase 2**
- SOS requests with SMS notifications, public SOS status page.
- Reminders ("You can donate again"), "Did you get help?" follow-up.
- Verified badges, e-certificates, shareable donor card.
- City SEO pages, PWA.

**Phase 3 (revenue layer)**
- Hospital / blood bank partner portal with dashboard.
- Camp management (slots, registration, certificates).
- Impact reports for CSR partners.

---

## 10. Master prompt to paste into Antigravity (Phase 1)

> Build a mobile-first web app called **BloodAccess** using **Vite + React (JavaScript, not TypeScript)**, **Tailwind CSS**, **react-router-dom**, **react-i18next** and **Supabase** (`@supabase/supabase-js`). It is a free platform where voluntary blood donors register and people who need blood can search donors by blood group and city.
>
> **Project structure:** `src/pages`, `src/components`, `src/lib/supabaseClient.js`, `src/i18n` (en.json, hi.json), `src/hooks`. Use functional components and hooks only. Keep Supabase keys in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), never hardcode them.
>
> **Design:** red `#D32F2F` primary, deep red `#B71C1C` hero, soft tint `#FBEFEF`, white background, Poppins font, rounded 12px cards, big tap targets (48px), blood groups as selectable pills. English and Hindi toggle on every page.
>
> **Pages and routes:** `/` Home (hero with quick search card, how it works, trust section, FAQ), `/find` Find Blood (filters + donor cards), `/register` Become a Donor (3-step form with react-hook-form, phone OTP and consent), `/dashboard` Donor Dashboard (availability toggle, last donated date, next eligible date, delete account), `/login` (phone OTP only), `/privacy`, `/terms`, `/how-it-works`.
>
> **Key rules:** Donor phone numbers are never public. Search reads from a database view `public_donors` that hides phone and full name. Phone is revealed only through a Supabase RPC function `reveal_contact` after the requester verifies their phone by OTP, with a limit of 5 reveals per 24 hours per requester, and every reveal is logged in `contact_events`. After a donation is logged, the donor is automatically unavailable until the cooldown ends (90 days men, 120 days women, configurable). Add a Report button on donor cards. Donors can delete their account and data anytime. Never add any payment feature.
>
> **Order of work:** First do project setup, Tailwind config with the design colors, the i18n setup, header, footer and the Home page. Then write the Supabase SQL (tables, `public_donors` view, Row Level Security, `reveal_contact` function) as a separate `.sql` file. Then stop and wait for my approval before building the next feature.

**Follow-up prompts (one at a time, after Phase 1 setup is approved):**

1. "Build the `/register` page as a 3-step form using react-hook-form. Step 1: name, age, gender, phone with OTP. Step 2: blood group pills, weight, last donation date, health checklist. Step 3: state, city, area, contact preference, consent checkboxes. Block under 18, over 65, or under 45 kg with a kind message. Save to Supabase `donors` table."
2. "Build the `/find` page with blood group pills, state and city dropdowns, and an Available now toggle. Fetch from the `public_donors` view. Show donor cards (first name + last initial, blood group badge, city and area, availability badge, last donated month and year, verified badge). Add a loading skeleton and an empty state."
3. "Build the Contact donor modal: collect requester name, phone, patient blood group, hospital, city, urgency. Send OTP, verify, then call the `reveal_contact` RPC and show Call and WhatsApp buttons (WhatsApp with prefilled message). Handle rate limit errors with friendly messages."
4. "Build `/dashboard` for logged-in donors: availability toggle, next eligible date, Log a donation (sets cooldown), contact history count, edit profile, and Delete my account and data."
5. "Add a Report button on donor cards that saves to the `reports` table, and a simple protected `/admin` page listing donors and open reports with suspend and verify actions."

**Tips for using Antigravity:**
- Paste sections 1 to 3 first for context, then the master prompt, then the follow-up prompts one by one. Large single prompts usually give messy code.
- After each step, test on a phone-sized screen and with a fake OTP (Supabase test phone numbers) before adding a real SMS provider.
- Keep SMS provider keys and the Supabase service key only in server-side environment variables. The anon key in the frontend is fine only because Row Level Security is on.
- Before launch, get a doctor or NGO partner to review the eligibility questions and the cooldown periods.
