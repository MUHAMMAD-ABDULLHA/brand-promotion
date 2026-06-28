# Brand Promotion Platform

An AI-driven, cloud-based marketing ecosystem that unifies campaign management, influencer collaboration, and performance analytics into a single product. Built for brands that want real-time control over how they spend, who they partner with, and how their audience responds.

---

## What it does

Most digital marketing stacks are a collection of disconnected tools, one for campaigns, another for analytics, a third for influencer outreach. This platform replaces that stack with a single system where every action is connected: a campaign created by a brand admin triggers collaborator recommendations, initializes a group chat, and begins logging analytics events in real time.

Three distinct user roles drive the platform:

**Brand Admins** create and manage campaigns, configure AR-enabled ads, review analytics dashboards, manage subscriptions, and discover influencer partners through AI-powered search.

**Influencers** receive collaboration requests, approve participation in combined campaigns, publish content, and track post-level performance across impressions, likes, comments, and shares.

**End Users** interact with a social feed, view AR ads, earn points through gamification campaigns, and engage with stories, posts, and direct messages.

---

## Core modules

**Campaign Management** - Full lifecycle control over marketing campaigns: create, edit, launch, and delete. Includes gamification campaign configuration (points and badges), AR ad enablement with 3D model upload support (`.glb`, `.usdz`), and a global leaderboard showing top-earning users by cumulative points.

**Ad Management** - AI-assisted ad creation that generates headline, audience, and location suggestions from a plain-text product description. Ads are served to users based on interest history and deprioritize previously engaged content. Location targeting is configurable per city. Media assets (image, video, AR model) are centralized through Cloudinary and tagged with the correct `mediaType` for cross-platform delivery.

**Analytics and Insights** - Brand-side dashboards surface total events, top campaigns, publisher performance tables (Impressions, Engagements, CTR), timeline line charts, and audience demographic pie charts broken down by age and target group. Detailed log-level data is exportable as an `.xlsx` file. Influencer-side dashboards show follower counts, cumulative content metrics, and per-post drill-downs with time-series engagement charts.

**Collaborative Marketing** - Combined campaigns link multiple collaborators under a single campaign structure. A partner discovery modal surfaces AI-ranked recommendations based on campaign context. Creating a combined campaign automatically initializes a dedicated group chat via WebSocket. A side-by-side comparison tool lets brand admins evaluate up to two campaigns across Impressions, Engagements, and CTR. Collaborators manage pending and approved requests through a dedicated approval workflow.

**Social Media Integration** - A full social layer: post creation, infinite-scroll feed, 24-hour expiring stories, follow/unfollow with pending request management for private accounts, real-time direct messaging with WebSocket connections, and post-level interaction (likes, comments, saves).

**Billing and Subscriptions** - Monthly and Annual subscription tiers managed through Stripe. Includes prorated upgrade logic, downgrade restriction enforcement, billing history with transaction status indicators, cancellation flow with confirmation, and coupon/discount support.

**Notifications** - Categorized notification feed (Campaign, Account, Other) with unread count badges, per-notification and bulk mark-as-read, and toast feedback on state changes.

**Customer Support** - A direct email support form for brand admins and a categorized FAQ accordion for self-service issue resolution.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Redux Toolkit, Tailwind CSS, Recharts |
| Backend | Go 1.21 (Gin), WebSocket service |
| Database | PostgreSQL 16 |
| Media | Cloudinary (images, video, 3D models) |
| Payments | Stripe |
| AI | Mistral AI (ad generation, collaborator recommendations) |
| Infrastructure | AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes |
| Auth | JWT with role-based access control |

---

## Getting started

### Prerequisites

- Node.js v18+
- Go 1.21+
- PostgreSQL 16

### Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173` by default.

### Backend

```bash
cd backend
go mod tidy
go run main.go
```

Runs at `http://localhost:8080` by default.

### Environment variables

Create `.env` files at both the root and `/backend` before running:

**Root `.env`**
```
VITE_API_BASE=http://localhost:8080
```

**`/backend/.env`**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brand_promotion
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MISTRAL_API_KEY=your_mistral_key
```

Neither file is committed to version control.

---

## Authentication and roles

Login routes to different dashboards based on the authenticated role:

| Role | Dashboard route |
|---|---|
| `brandAdmin` | `/unified-ad-dashboard` |
| `endUser` | `/user-management` |
| `influencer` | `/influencer` |

---

## Data model

The platform manages 27 entities across campaign, ad, analytics, social, billing, messaging, and gamification domains. The full data dictionary with field names, types, constraints, and foreign key relationships is documented in `context.md` at the workspace root.

Key relationships worth noting:

- A `CombineCampaign` links one base `Campaign` to multiple `CombineCampaignCollaborator` records, each with an `approved` status of `pending`, `approved`, or `rejected`.
- An `Ad` carries an `EnableAR` flag and an `ARURL` pointing to the uploaded 3D asset. The `mediaType` field is set to `ar` when AR is active.
- `AdAnalytics` and `PostAnalytics` log discrete events (`impression`, `click`, `engagement`, `like`, `comment`, `share`) tied to a user ID and timestamp, forming the raw data behind every chart and export.
- A `Conversation` can be `direct` or `group` and is optionally linked to a `Campaign` ID, which is how combined campaign group chats are created automatically.
