# SkillBridge Campus

A verified, campus-only peer network for skill help and project teammates. Built with React + TypeScript + Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Demo Script (2-minute walkthrough for judges)

### 1. Landing Page → Sign Up
- Visit `/` - see the value prop: "Verified campus peers. No ghosting. Proof of work."
- Click "Get Started Free" → `/auth?mode=signup`
- Enter any `@skillbridge.edu` email (e.g., `alex@skillbridge.edu`)
- Password: anything 8+ chars
- OTP: **123456** (hardcoded for demo)
- See "Verified Student" badge

### 2. Onboarding
- Fill name: "Alex Morgan"
- Branch: "Computer Science", Year: 3
- Skills: React, TypeScript, CSS (add 3-5)
- Availability: "Available now"
- Bio: "Full-stack dev passionate about clean UI"
- Complete → lands on Dashboard with 10 welcome credits

### 3. Post a Buddy Need
- Click "Post a Buddy Need" card
- Mode: Buddy (already selected)
- Title: "Portfolio Site - Need UI + Frontend"
- Description: "Building a personal portfolio to showcase ML projects. Have backend ready, need designer and frontend dev."
- Required Skills: Figma, React, CSS, TypeScript
- Deadline: 2 weeks from now
- Roles: 
  1. "UI/UX Designer" - Skills: Figma, UI/UX
  2. "Frontend Developer" - Skills: React, TypeScript, CSS
- Post → redirected to `/matches/:needId`

### 4. View Matches
- See 3-4 match cards with scores (92%, 87%, 78%)
- Each card shows: name, rating, avatar, skills, availability, match reasons as chips
- Click top match (e.g., "Sarah Kim - 92% Match")

### 5. Chat Room & Consent Gate
- Opens `/room/:matchId` with mock conversation
- See "Waiting for Sarah to accept" status
- **Demo Panel** (bottom right) → Set "Simulated Partner Consent" to "Accepted"
- Status updates: "They accepted! Tap 'Go Ahead' to start."
- Click "Go Ahead" → "Both accepted! Collaboration started"
- Button "Define Agreement" appears

### 6. Agreement
- Opens `/agreement/:matchId`
- Roles pre-filled from need, add responsibilities
- Deadline pre-filled, Expected Output: "Deployed portfolio site with case studies, responsive design, clean code"
- Click "Save Agreement & Generate Project Card"

### 7. Verified Project Card
- Opens `/project-card/:projectId`
- Shows: title, both participants with roles, skills used, timeline, verification badge
- Click "Download as Image" (uses html2canvas)
- Click "Copy Share Link" → copies public URL like `/project/abc123`

### 8. Credits Updated
- Navigate to `/credits`
- Balance: 13 (was 10, +3 for completing Buddy project)
- History shows: "Complete Buddy Project +3 credits"

### 9. Rewards
- Navigate to `/rewards`
- See 5 rewards: Canteen Credit (5), Faculty Certificate (10), Workshop Priority (8), Fest Perks (15), Mentor Badge (20)
- Redeem "Canteen Credit" → balance drops to 8, toast confirms

### 10. Feedback & Trust Badges
- After project, feedback form appears (private ratings)
- Public profile shows earned trust badges: "Reliable", "Great Mentor", etc.

## Demo Panel (Dev Only)

Bottom-right ⚡ button opens panel with:
- **Reset & Reseed** - Clears all localStorage, re-seeds 12 mock users + 4 needs
- **Simulated Partner Consent** - Toggle other user's consent (Pending/Accepted/Rejected)
- **Quick Actions** - Add/remove credits, stop impersonation
- **Jump To** - Quick navigation to key pages
- **Impersonate** - Switch current user to any of 12 mock students

## Architecture

### Folder Structure
```
src/
├── components/
│   ├── ui/           # Button, Input, Card, Badge, Avatar, Modal, Select, etc.
│   ├── layout/       # Navbar, DemoPanel
│   ├── cards/        # MatchCard, ProjectCard
│   ├── chat/         # ConsentButton, ConsentStatus
│   └── forms/        # (form components)
├── pages/            # Landing, Auth, Onboarding, Dashboard, PostNeed, Matches, ChatRoom, Agreement, ProjectCard, Credits, Rewards, Profile
├── services/         # authService, userService, needService, matchService, consentService, projectService, creditService, feedbackService
├── utils/            # matching.ts (computeMatchScore), storage.ts, helpers.ts, constants.ts, validation.ts
├── hooks/            # useAuth, useDemoPanel, useToast, useLocalStorage
├── contexts/         # AuthContext, DemoContext
├── types/            # All TypeScript interfaces
├── data/             # mockData.ts (12 seeded users)
└── App.tsx           # Routes + providers
```

### Data Models
- **User** - id, email, name, branch, year, skills[], availability, bio, rating, credits, trustBadges[], isVerified
- **Need** - id, authorId, mode (learn/buddy), title, description, requiredSkills[], duration/deadline, rolesNeeded[], status
- **Match** - id, needId, seekerId, providerId, score (0-100), reasons[], status
- **Collaboration** - id, matchId, needId, participants[], consentStatus{}, agreement?, projectCardId, status
- **ProjectCard** - id, collaborationId, title, participants[], roles[], skillsUsed[], startDate, endDate, description, shareToken
- **CreditTransaction** - id, userId, type (earned/spent), amount, reason, referenceId
- **Feedback** - id, collaborationId, fromUserId, toUserId, ratings{}, comment, isAnonymous

### Matching Algorithm (`src/utils/matching.ts`)

**Pure function** `computeMatchScore(seeker, provider, need, allUsers)` → `{ score, reasons[] }`

| Factor | Learn Mode | Buddy Mode | Weight |
|--------|------------|------------|--------|
| Skill Fit (direct overlap) | ✓ | - | 40% |
| Complementary Skills | - | ✓ | 40% |
| Availability | ✓ | ✓ | 20% |
| Rating (0-5) | ✓ | ✓ | 20% |
| Same College Domain | ✓ | ✓ | 10% |
| Credit Activity | ✓ | ✓ | 10% |

**Learn Mode**: Matches users who HAVE the skills you NEED
**Buddy Mode**: Matches users who HAVE skills you LACK (complementary)

## AWS Mapping (Future Production)

| Service | Current (localStorage) | AWS Target |
|---------|------------------------|------------|
| Auth | `authService` | **Cognito** (User Pools + Identity Pools) |
| Users | `userService` | **DynamoDB** (Users table, PK: userId, GSI: email) |
| Needs | `needService` | **DynamoDB** (Needs table, PK: needId, GSI: authorId, status) |
| Matching | `matchService` + `computeMatchScore` | **Lambda** (API Gateway → Lambda runs matching) |
| Consent | `consentService` | **DynamoDB** (Collaborations table, PK: collabId, GSI: userId) |
| Projects | `projectService` | **S3** (card assets) + **DynamoDB** (ProjectCards) |
| Credits | `creditService` | **DynamoDB** (CreditTransactions, PK: userId, SK: timestamp) |
| Feedback | `feedbackService` | **DynamoDB** (Feedback table, PK: collabId, SK: fromUserId) |
| Hosting | Vite dev server | **CloudFront** + **S3** (static hosting) |

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (custom components, no external UI library)
- **React Router v6** (client-side routing)
- **Zod** (form validation)
- **date-fns** (date formatting)
- **html2canvas** (project card image download)
- **lucide-react** (icons)

## Key Features Implemented

✅ College email verification (`@skillbridge.edu`) with mock OTP (123456)
✅ Profile creation with skills, availability, bio
✅ Two modes: Learn (30-min help) & Buddy (project teammates)
✅ Smart matching with % score & human-readable reasons
✅ Mutual consent gate - both must tap "Go Ahead"
✅ Chat room with mock messages
✅ Agreement with roles, responsibilities, deadline, expected output
✅ Verified Project Card (portfolio-ready, downloadable as PNG, shareable link)
✅ SkillCredits economy: teach=+1, complete project=+3, request=-1
✅ Campus Reward Store (5 mock rewards)
✅ Private feedback → public trust badges
✅ Demo Panel for hackathon presentations
✅ Mobile-first responsive design
✅ Clean animations (slide-in, pulse, scale-in)

## Environment Variables

Create `.env` file (optional):
```
VITE_COLLEGE_DOMAIN=@skillbridge.edu
VITE_WELCOME_CREDITS=10
```

## License

MIT - Built for hackathon demo purposes.