# CartWise Tasks Checklist

## Step 0: Project Setup & Preparation
- [x] Create project directory structure (`cartwise/design`, `cartwise/reference`, `cartwise/test-images`)
- [x] Create `AGENTS.md` with system constraints and architectural rules
- [x] Add Stitch exports (HTML + screenshots) into `cartwise/design/Desktop` and `cartwise/design/Mobile`
- [x] Add mentor reference files (`setup_db.py`, `shopping_agent.py`, `reviews_api.py`, `app.py`, `store.db`) to `cartwise/reference/`
- [x] Extract and rename test images (`honey.png`, `oats.png`, `elephant.png`, `avocado_oil.png`, `rolled_oats.png`, etc.)

## Step 1: Database & Data Ingestion
- [x] Set up SQLite with `better-sqlite3` at `cartwise/data/store.db`
- [x] Seed and verify 32 products and 102 reviews matching mentor's database schema
- [x] Build data access layer in `cartwise/lib/db.ts` (`searchProducts`, `getProductById`, `createOrder`, `getOrders`)
- [x] Guarantee zero-hallucination querying strictly from SQLite records

## Step 2: Next.js Foundation & Design System
- [x] Initialize Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Configure Organic Intelligence design tokens (`#1B4D3E` pine, `#2D7A54` green, `#FBF9F5` cream, Plus Jakarta Sans)
- [x] Apply iOS zoom-on-refresh fixes (exact viewport meta tag and html/body overflow CSS)
- [x] Build responsive layout supporting Desktop first then Mobile views

## Step 3: Agent Abstraction (`/lib/agent/`)
- [x] Define TypeScript contracts in `cartwise/lib/types.ts`: `text`, `products`, `image_analysis`, `clarify`, `compare`, `empty_state`
- [x] Implement `handleChat(messages)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Implement `handleImage(file)` with `AGENT_MODE=mock|real` switch (default: `mock`) in `cartwise/lib/agent/`
- [x] Ground all candidate matches in SQLite queries with zero invented data

## Step 4: UI Components & Chat Interface
- [x] Implement dedicated React component for each structured message type:
  - [x] `TextMessage`
  - [x] `ProductsMessage` (grid/list with organic badges, star ratings, non-truncated titles, deterministic Add to Cart / Buy Now buttons)
  - [x] `ImageAnalysisMessage` (uploaded thumbnail, vision tags, description, matched product cards, non-product fallback)
  - [x] `ClarifyMessage` (interactive option pills)
  - [x] `CompareMessage` (side-by-side comparison matrix with attributes and ratings)
  - [x] `EmptyStateMessage` (reasoning and clickable alternative suggestions)
  - [x] `ThinkingMessage` (animated thinking state and trace indicators)
  - [x] `AgentTraceModal` (full inspector showing parsed intent, filters, and SQL executed against SQLite)
- [x] Implement `Navbar` with New Chat, Agent Trace inspector, Cart badge, and mobile drawer
- [x] Implement `EmptyChatPrompt` with 4 1-click suggestion cards and camera tips
- [x] Implement fixed `ChatInput` with photo upload and 1-click sample test images (`honey.png`, `oats.png`, `elephant.png`)

## Step 5: Shopping Cart & Order API
- [x] Implement deterministic `/api/orders` route saving to SQLite `orders` table
- [x] Implement `/api/chat` and `/api/image-search` routes
- [x] Implement `CartDrawer` with 3-step checkout flow (Cart -> Review Order -> Order Confirmed)
- [x] Implement `OrdersView` tab listing past orders recorded in SQLite
- [x] Verify production build passes with 0 errors (`npm run build`)
