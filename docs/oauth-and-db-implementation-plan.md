# OAuth & Database Implementation Plan

## Overview

This document outlines the implementation plan for adding Google OAuth authentication (via NextAuth.js) and PostgreSQL database persistence (via Prisma ORM on NeonDB) to the Kapruka AI Shopping Agent.

---

## 1. Authentication — Google OAuth with NextAuth.js

### 1.1 Package Installation

```bash
npm install next-auth@5 @auth/prisma-adapter
```

NextAuth v5 (Auth.js) is the latest version compatible with Next.js 16 App Router.

### 1.2 Configuration Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth config: Google provider, Prisma adapter, session strategy, callbacks |
| `app/api/auth/[...nextauth]/route.ts` | Auth API route handler |
| `middleware.ts` | Route protection (redirect unauthenticated users) |

### 1.3 Auth Configuration (`lib/auth.ts`)

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

### 1.4 Environment Variables (already in `.env`)

```
AUTH_SECRET=<already set>
AUTH_GOOGLE_ID=<already set>
AUTH_GOOGLE_SECRET=<already set>
```

### 1.5 Middleware — Route Protection (`middleware.ts`)

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/api/chat",
    // Exclude auth routes, static assets, API auth
  ],
};
```

**Logic:**
- If user not authenticated → redirect to `/login`
- `/login` page is public
- `/api/auth/*` routes are public
- `/api/chat` is protected (returns 401 if no session)

### 1.6 Security Measures

- **CSRF protection**: Built into NextAuth v5
- **Session stored in database**: Not JWT — prevents token theft
- **AUTH_SECRET**: Used for encryption of session cookies
- **Secure cookies**: Automatic in production (HTTPS)
- **OAuth state parameter**: Prevents CSRF in OAuth flow
- **Prisma adapter**: Links Google account to DB user record

### 1.7 UI Changes

#### Login Page (`app/login/page.tsx`)

Design:
- Full-screen centered layout
- Kapruka branding (logo + tagline)
- "Continue with Google" button (branded)
- Subtle gradient background
- Animated entrance (Framer Motion)

#### Sidebar User Section Updates

**Logged out state:**
- Show "Sign In" button

**Logged in state:**
- User avatar (from Google profile image)
- User name + email (from session)
- Logout icon button

### 1.8 API Route Protection

Update `app/api/chat/route.ts`:
```typescript
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... existing logic, with session.user.id for DB queries
}
```

---

## 2. Database — Prisma ORM on NeonDB

### 2.1 Package Installation

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2.2 Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ AUTH (NextAuth required tables) ============

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?

  accounts Account[]
  sessions Session[]

  // App relations
  chatThreads ChatThread[]
  orders      Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============ CHAT ============

model ChatThread {
  id        String   @id @default(cuid())
  userId    String
  title     String   @default("New conversation")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages ChatMessage[]

  @@index([userId, updatedAt(sort: Desc)])
}

model ChatMessage {
  id        String   @id @default(cuid())
  threadId  String
  role      String   // "user" | "assistant"
  content   Json     // Full message parts (text, tool calls, etc.)
  createdAt DateTime @default(now())

  thread ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@index([threadId, createdAt])
}

// ============ ORDERS ============

model Order {
  id          String   @id @default(cuid())
  userId      String
  orderRef    String   @unique
  checkoutUrl String
  expiresAt   DateTime
  status      String   @default("pending") // pending | paid | expired | cancelled

  // Order data
  items       Json     // Cart items snapshot
  summary     Json     // { items_total, delivery_fee, grand_total, currency }
  recipient   Json     // { name, phone }
  delivery    Json     // { address, city, date, locationType, instructions }
  sender      Json     // { name }
  giftMessage String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
}
```

### 2.3 Database Client (`lib/db.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 2.4 Migration Steps

```bash
npx prisma db push          # Initial schema push to NeonDB
npx prisma generate         # Generate Prisma client
```

For production workflow:
```bash
npx prisma migrate dev --name init   # Create migration file
npx prisma migrate deploy            # Apply in production
```

---

## 3. Data Migration Strategy

### What stays in localStorage:
- `kapruka-settings` (theme, language, currency)
- `kapruka-shopping-state` (cart only — ephemeral)

### What moves to the database:

| Data | Current Storage | New Storage | Table |
|------|----------------|-------------|-------|
| Chat threads (list) | localStorage `kapruka-chat-history` | PostgreSQL | `ChatThread` |
| Chat messages | localStorage `chat-messages-{id}` | PostgreSQL | `ChatMessage` |
| Orders | Not persisted | PostgreSQL | `Order` |
| User profile | Hardcoded | Google OAuth → `User` table | `User` |

### 3.1 Chat History Migration

**New API routes:**
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/threads` | GET | List user's threads |
| `/api/threads` | POST | Create new thread |
| `/api/threads/[id]` | DELETE | Delete thread + messages |
| `/api/threads/[id]/messages` | GET | Load thread messages |
| `/api/threads/[id]/messages` | POST | Save new messages |

**Chat container changes:**
- On mount: fetch messages from `/api/threads/[id]/messages`
- On new message: POST to save
- On `onFinish`: save assistant response to DB
- Remove localStorage message persistence

**Sidebar changes:**
- Fetch threads from `/api/threads` instead of Zustand
- Real-time updates via state + API sync

### 3.2 Order Persistence

After `kapruka_create_order` tool succeeds:
- Save order to `Order` table via `/api/orders` POST
- Link to current user
- Store full snapshot (items, delivery, recipient, etc.)

New route: `/api/orders` (GET list, POST create)

---

## 4. Implementation Order

### Phase A: Database Setup (do first)
1. Install Prisma + `@prisma/client`
2. Create `prisma/schema.prisma` with all models
3. Run `npx prisma db push` to create tables on NeonDB
4. Create `lib/db.ts` singleton

### Phase B: Authentication
1. Install `next-auth@5` + `@auth/prisma-adapter`
2. Create `lib/auth.ts` with Google provider + Prisma adapter
3. Create `app/api/auth/[...nextauth]/route.ts`
4. Create `middleware.ts` for route protection
5. Create `app/login/page.tsx` (attractive login UI)
6. Update sidebar user section (dynamic based on session)
7. Protect `/api/chat` route

### Phase C: Data Migration
1. Create API routes for threads + messages
2. Update `ChatContainer` to fetch/save from DB
3. Update sidebar to load threads from API
4. Create order API route
5. Update `CheckoutCard` to persist orders
6. Remove localStorage chat persistence code
7. Test full flow: login → chat → order → persistence

### Phase D: Cleanup
1. Remove `useChatHistoryStore` Zustand store (replaced by API)
2. Remove localStorage `chat-messages-*` logic
3. Keep `useShoppingStore` (cart) and `useSettingsStore` in localStorage
4. Update `lib/store.ts` to remove chat-related state

---

## 5. Architecture Diagram

```mermaid
graph TB
    subgraph "Client (Browser)"
        UI[Chat UI]
        ZS_CART[Zustand: Cart + Settings<br/>localStorage]
    end

    subgraph "Next.js Server"
        MW[Middleware<br/>Auth Check]
        AUTH[NextAuth v5<br/>Google OAuth]
        API_CHAT[/api/chat]
        API_THREADS[/api/threads]
        API_ORDERS[/api/orders]
        ORC[Orchestrator]
    end

    subgraph "External"
        GOOGLE[Google OAuth]
        BRK[Amazon Bedrock]
        MCP[Kapruka MCP]
        DB[(NeonDB<br/>PostgreSQL)]
    end

    UI -->|Protected| MW
    MW -->|Authenticated| API_CHAT
    MW -->|Redirect if no session| AUTH
    AUTH <-->|OAuth flow| GOOGLE
    AUTH -->|Session + User| DB

    API_CHAT --> ORC
    ORC --> BRK
    ORC --> MCP

    API_THREADS --> DB
    API_ORDERS --> DB
    UI --> API_THREADS
    UI --> API_ORDERS
    UI --> ZS_CART
```

---

## 6. Security Checklist

- [x] OAuth state parameter (NextAuth built-in)
- [x] CSRF token validation (NextAuth built-in)
- [x] Database sessions (not JWT — prevents token theft)
- [x] AUTH_SECRET for cookie encryption
- [x] Secure cookies in production (HTTPS only)
- [x] API route protection with `auth()` check
- [x] Middleware-level route protection
- [x] User-scoped DB queries (always filter by `userId`)
- [x] Prisma parameterized queries (SQL injection prevention)
- [x] No sensitive data in client state
- [x] Google credentials only server-side (env vars)
- [x] Cascade deletes (user deletion cleans all data)

---

## 7. File Structure (New/Modified)

```
├── prisma/
│   └── schema.prisma              # NEW: Database schema
├── lib/
│   ├── auth.ts                    # NEW: NextAuth configuration
│   ├── db.ts                      # NEW: Prisma client singleton
│   └── store.ts                   # MODIFIED: Remove chat history state
├── app/
│   ├── login/
│   │   └── page.tsx               # NEW: Login page
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts       # NEW: Auth API handler
│   │   ├── threads/
│   │   │   ├── route.ts           # NEW: List/create threads
│   │   │   └── [id]/
│   │   │       ├── route.ts       # NEW: Delete thread
│   │   │       └── messages/
│   │   │           └── route.ts   # NEW: Get/save messages
│   │   └── orders/
│   │       └── route.ts           # NEW: List/create orders
│   └── chat/
│       └── [id]/
│           └── page.tsx           # MODIFIED: Fetch from DB
├── components/
│   └── layout/
│       └── sidebar.tsx            # MODIFIED: Auth-aware user section
├── middleware.ts                   # NEW: Route protection
└── .env                           # MODIFIED: Already has all credentials
```
