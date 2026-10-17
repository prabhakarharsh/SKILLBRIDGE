<div align="center">

# 🌉 SkillBridge 

**Verified campus peers. No ghosting. Proof of work.**

A verified, campus-only peer network where students get quick skill help and find reliable project teammates, with no cash changing hands between students.

[**Live Demo**](https://skillbridge-1-v3z7.onrender.com) · [Features](#-features) · [Getting Started](#-getting-started) · [Demo Walkthrough](#-demo-walkthrough-2-minutes) · [Architecture](#-architecture)

</div>

---
<img width="1917" height="1078" alt="Screenshot 2026-10-17 105003" src="https://github.com/user-attachments/assets/4a09b80d-5b40-4cdb-b6a8-db189837f5ea" />

<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/801c91d2-dc83-49cd-8924-6c4aad983d71" />

## 📌 Overview

Students usually look for help or teammates through unstructured channels: WhatsApp groups, Discord servers, random seniors, national hackathon platforms or paid tutoring apps. The result is ghosting, unequal workload, failed projects and zero accountability.

**SkillBridge Campus** is a *trust layer* on top of normal campus collaboration. It combines:

- **Verification**: college-email-only access
- **Mandatory mutual consent**: a match is only a suggestion until both people agree
- **Proof of work**: portfolio-ready Verified Project Cards
- **Peer credits**: SkillCredits instead of money

## 🔀 Two Modes

| Mode | Purpose | Example |
|---|---|---|
| 🟢 **Learn Mode** | Quick 20-30 minute skill help | "30 mins help with CSS Flexbox" |
| 🟡 **Buddy Mode** | Longer-term project teammate with defined roles and deadlines | "Need UI + Frontend for portfolio site" |

## 🔁 Core 5-Step Flow

```
Post Need → Get Matched → Mutual Consent → Do the Work → Verified Proof
```

1. **Post Need**: describe the help or teammate you need
2. **Get Matched**: receive a match % with explicit reasons
3. **Mutual Consent**: both users must tap **Go Ahead** (the main anti-ghosting mechanism)
4. **Do the Work**: discussion room plus a shared agreement
5. **Verified Proof**: a portfolio-ready Verified Project Card

## ✨ Features

- ✅ **College email verification** with OTP (demo OTP: `123456`)
- ✅ **Profiles** with skills, availability, bio, rating and credits
- ✅ **Smart Match Score** with a percentage and human-readable reasons
- ✅ **Consent Gate**: nothing starts until both sides accept
- ✅ **Discussion room** to align on scope and timing
- ✅ **Agreement** covering roles, responsibilities, deadline and expected output
- ✅ **Verified Project Card**: downloadable as an image and shareable via link
- ✅ **SkillCredits economy**: teach = +1, complete a Buddy project = +3, request help = -1
- ✅ **Campus Reward Store**: canteen credit, faculty certificate, workshop priority, fest perks and more
- ✅ **Private feedback, public trust**: detailed ratings stay private, only trust badges are public
- ✅ **Demo Panel** for hackathon presentations
- ✅ Mobile-first responsive design

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS (Next.js, see `frontend/`) |
| Backend | Node.js (see `backend/`) |
| Validation | Zod |
| Utilities | date-fns, html2canvas, lucide-react |
| Hosting | Render |

<!-- VERIFY: confirm the exact frontend framework/version and backend framework/database from frontend/package.json and backend/package.json, then adjust this table. -->

## 📁 Project Structure

```
SKILLBRIDGE/
├── frontend/          # Web app (UI, pages, components)
├── backend/           # API server
├── .kiro/hooks/       # Kiro IDE hooks
├── AGENTS.md          # AI coding-agent instructions
├── fix-imports.ps1    # Helper script to fix import paths
├── package.json       # Root scripts that orchestrate frontend + backend
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/prabhakarharsh/SKILLBRIDGE.git
cd SKILLBRIDGE

# Install frontend and backend dependencies
npm run install:all
```

### Run in development

Open two terminals:

```bash
# Terminal 1: backend
npm run dev:backend

# Terminal 2: frontend
npm run dev:frontend
```

<!-- VERIFY: add the actual local URLs/ports (e.g. frontend http://localhost:3000, backend http://localhost:5000). -->

### Production build

```bash
npm run build      # builds the frontend
npm run start      # starts the frontend
```

### Available root scripts

| Script | What it does |
|---|---|
| `npm run install:all` | Installs dependencies in `frontend/` and `backend/` |
| `npm run dev:frontend` | Starts the frontend in dev mode |
| `npm run dev:backend` | Starts the backend in dev mode |
| `npm run start:frontend` | Starts the frontend (production) |
| `npm run start:backend` | Starts the backend (production) |
| `npm run build` | Builds the frontend |
| `npm run start` | Starts the frontend |

### Environment variables (optional)

Create a `.env` file where required:

```env
VITE_COLLEGE_DOMAIN=@skillbridge.edu
VITE_WELCOME_CREDITS=10
```

<!-- VERIFY: if the app is Next.js, these may be NEXT_PUBLIC_* instead of VITE_*. Also list any backend variables (PORT, DB URL, JWT secret). -->

## 🎬 Demo Walkthrough (2 minutes)

1. **Sign up**: use any `@skillbridge.edu` email (e.g. `alex@skillbridge.edu`), a password of 8+ characters, and OTP `123456`. You'll see the **Verified Student** badge.
2. **Onboarding**: add name, branch, year, 3-5 skills, availability and a bio. You land on the dashboard with **10 welcome credits**.
3. **Post a Buddy Need**: e.g. "Portfolio Site - Need UI + Frontend", with required skills (Figma, React, CSS, TypeScript), a deadline and roles (UI/UX Designer, Frontend Developer).
4. **View matches**: see match cards with scores (e.g. 92%, 87%, 78%) and reason chips.
5. **Chat room and Consent Gate**: open the top match. In the **Demo Panel**, set *Simulated Partner Consent* to **Accepted**, then tap **Go Ahead**. Collaboration starts.
6. **Agreement**: confirm roles, deadline and expected output, then **Save Agreement & Generate Project Card**.
7. **Verified Project Card**: download as an image or copy the share link.
8. **Credits**: balance goes from 10 to 13 (+3 for completing a Buddy project).
9. **Rewards**: redeem a reward (e.g. Canteen Credit) and watch the balance drop.
10. **Feedback**: leave private ratings; earned public Trust Badges appear on the profile.

### ⚡ Demo Panel (dev only)

The ⚡ button (bottom-right) opens a panel with:

- **Reset & Reseed**: clears data and re-seeds 12 mock users and 4 needs
- **Simulated Partner Consent**: toggle the other user's consent (Pending / Accepted / Rejected)
- **Quick Actions**: add or remove credits, stop impersonation
- **Jump To**: quick navigation to key pages
- **Impersonate**: switch to any of the 12 mock students

## 🏗 Architecture

### Data models

| Model | Key fields |
|---|---|
| **User** | id, email, name, branch, year, skills[], availability, bio, rating, credits, trustBadges[], isVerified |
| **Need** | id, authorId, mode (learn/buddy), title, description, requiredSkills[], duration/deadline, rolesNeeded[], status |
| **Match** | id, needId, seekerId, providerId, score (0-100), reasons[], status |
| **Collaboration** | id, matchId, needId, participants[], consentStatus, agreement, projectCardId, status |
| **ProjectCard** | id, collaborationId, title, participants[], roles[], skillsUsed[], startDate, endDate, shareToken |
| **CreditTransaction** | id, userId, type (earned/spent), amount, reason, referenceId |
| **Feedback** | id, collaborationId, fromUserId, toUserId, ratings, comment, isAnonymous |

### Matching algorithm

Matching lives in a single pure function, `computeMatchScore(seeker, provider, need, allUsers)`, which returns `{ score, reasons[] }`.

| Factor | Weight |
|---|---|
| Skill fit (Learn Mode: direct overlap) / Complementary skills (Buddy Mode) | 40% |
| Availability | 20% |
| Rating (0-5) | 20% |
| Same college domain | 10% |
| Credit activity | 10% |

- **Learn Mode** matches people who *have* the skills you *need*.
- **Buddy Mode** matches people who have the skills you *lack* (complementary).

### SkillCredits economy

| Action | Credits |
|---|---|
| Welcome bonus | +10 |
| Teach a 30-min session | +1 |
| Complete a verified Buddy project | +3 |
| Request help | -1 |

## ☁️ AWS Roadmap

The service layer is designed to be swapped for AWS services in production:

| Concern | Current | AWS target |
|---|---|---|
| Auth | `authService` | Cognito (User Pools + Identity Pools) |
| Users, Needs, Credits, Feedback | `userService`, `needService`, `creditService`, `feedbackService` | DynamoDB |
| Matching | `matchService` + `computeMatchScore` | API Gateway + Lambda |
| Consent | `consentService` | DynamoDB (Collaborations table) |
| Project Cards | `projectService` | S3 (assets) + DynamoDB |
| Hosting | Render | CloudFront + S3 |

## 💼 Business Model

- **No cash between students.** Helpers earn SkillCredits and spend them to request help.
- Credits can be redeemed in the **Campus Reward Store**.
- **Revenue:** per-college licensing for a branded, admin-managed version.

## 🗺 Roadmap

- [ ] Real email delivery for OTP
- [ ] Real-time chat (WebSockets)
- [ ] Migration to AWS (Cognito, Lambda, DynamoDB, S3, CloudFront)
- [ ] Admin dashboard for colleges
- [ ] Pilot at one college with a real hackathon or fest

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, commit your changes and open a pull request.

## 📄 License

MIT. Built for hackathon demo purposes.

## 👤 Author

**Harsh Prabhakar**: [@prabhakarharsh](https://github.com/prabhakarharsh)
