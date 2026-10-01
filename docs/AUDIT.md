# CartWise Codebase & Implementation Audit

**Audit Date:** October 1, 2026  
**Auditor:** Automated Engineering Audit Agent (Pair Programming Inspection)  
**Workspace:** `/Users/rishavroy/Euphoria/cartwise`  
**Execution Environment:** Node v26.9.0, Next.js 16.3.8 (App Router), React 19.2.8, SQLite via `better-sqlite3` v13.0.3  
**Status Key:**  
- **DONE**: Fully implemented, verified against code and live runtime execution.  
- **PARTIAL**: Partially implemented or functioning with known behavioral limitations/workarounds.  
- **MISSING**: Not implemented or absent in the codebase.

---

## 1. Setup & Installation Verification

### Clean Clone Installation Procedure
To install and run CartWise from a fresh repository clone, execute the following commands:

```bash
# 1. Clone repository & enter directory
git clone https://github.com/Rishavroy-2006/CartWise.git
cd CartWise

# 2. Check Node version (v20+ supported; verified on v26.9.0)
node -v

# 3. Install dependencies
npm install

# 4. Verify / Seed SQLite database
python3 reference/setup_db.py
mkdir -p data
cp reference/store.db data/store.db

# 5. Run Next.js development server
npm run dev
# Or build for production
npm run build && npm start
```

### Audit Findings:
- **Node Version**: `v26.9.0` (also compatible with `v20.x` and `v22.x`). Status: **DONE**
- **Environment Variables**:
  - `AGENT_MODE`: `mock` (default) or `real`. Verified in `lib/agent/index.ts`.
  - `PORT`: defaults to `3000`.
  - External LLM keys (optional): `GROQ_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`.
  - Status: **DONE**
- **Database Seed & Reset Command**:
  - `python3 reference/setup_db.py` creates and seeds `reference/store.db`.
  - `cp reference/store.db data/store.db` resets the active application database.
  - Both commands run cleanly from terminal without errors.
  - Status: **DONE** (Evidence: `reference/setup_db.py`, `lib/db.ts:48-55`)

---

## 2. File Structure

```text
cartwise/
├── app/                  # Next.js App Router (Layout, Page, Global CSS, and API endpoints)
│   ├── api/              # Backend server route handlers
│   │   ├── chat/         # POST /api/chat: orchestrates handleChat agent pipeline
│   │   ├── image-search/ # POST /api/image-search: image analysis & matching
│   │   ├── orders/       # GET/POST /api/orders: deterministic order persistence
│   │   └── products/     # GET /api/products: queryable SQLite product search
│   ├── globals.css       # Tailwind CSS & design tokens (Organic Intelligence theme)
│   ├── layout.tsx        # HTML shell, metadata, and responsive viewport tags
│   └── page.tsx          # Main Chat UI, tab switcher, and message stream
├── components/           # Modular React UI components
│   ├── Navbar.tsx        # Top navigation, Cart counter, New Chat & Agent Trace triggers
│   ├── ChatInput.tsx     # Conversational prompt input, file upload & sample images
│   ├── cart/             # Cart Drawer (Cart -> Review -> Confirmed flow)
│   │   └── CartDrawer.tsx
│   ├── chat/             # Dedicated renderer components for structured assistant messages
│   │   ├── AgentTraceModal.tsx      # Full inspector modal for SQL queries and step traces
│   │   ├── ClarifyMessage.tsx       # Interactive option pills for disambiguation
│   │   ├── CompareMessage.tsx       # Side-by-side product comparison matrix
│   │   ├── EmptyChatPrompt.tsx      # Welcome screen with 4 1-click suggested prompts
│   │   ├── EmptyStateMessage.tsx    # No-results card with actionable suggestions
│   │   ├── ImageAnalysisMessage.tsx # Vision tags, preview thumbnail, and catalog matches
│   │   ├── ProductsMessage.tsx      # Responsive product cards with ratings, Buy & Add
│   │   ├── TextMessage.tsx          # Conversational text bubble
│   │   ├── ThinkingMessage.tsx      # Animated skeleton/spinner during query processing
│   │   └── UserBubble.tsx           # User chat bubble
│   └── orders/           # Past orders view
│       └── OrdersView.tsx           # Order history, search, and 1-click Reorder
├── context/              # Client-side React context
│   └── CartContext.tsx   # Global cart items, pricing calculations, and drawer states
├── data/                 # Live runtime database storage
│   └── store.db          # Active SQLite database file
├── design/               # Stitch reference exports (HTML mockups & design assets)
│   ├── Desktop/          # 15 desktop screens (cart, compare, trace, empty, search error)
│   └── Mobile/           # 16 mobile screens (drawers, carousel, order confirmed, etc.)
├── docs/                 # Project documentation and audit reports
│   └── AUDIT.md          # Comprehensive audit report
├── lib/                  # Backend business logic, database client, and agent contracts
│   ├── db.ts             # SQLite queries via better-sqlite3 (products, reviews, orders)
│   ├── types.ts          # TypeScript interfaces (Product, AssistantMessage, Order, etc.)
│   └── agent/            # AI Agent orchestration layer
│       ├── index.ts      # Unified handleChat & handleImage facade with AGENT_MODE switch
│       ├── mock.ts       # Truthful deterministic mock engine with reasoning traces
│       └── real.ts       # Real LLM adapter (falls back to mock if no API key is set)
├── public/               # Static assets & public images
│   └── images/           # Product and sample vision test images
├── reference/            # Mentor source files and pristine database seed script
│   ├── app.py            # Reference mentor Flask application
│   ├── reviews_api.py    # Reference reviews helper
│   ├── setup_db.py       # Deterministic SQLite schema creation & seed script
│   ├── shopping_agent.py # Mentor reference agent logic
│   └── store.db          # Baseline seed SQLite database
└── test-images/          # Sample images for vision testing (honey.png, oats.png, elephant.png)
```

---

## 3. Database Audit

### Database Files
- Active DB: `data/store.db` (and `reference/store.db`)
- Engine: SQLite 3 via `better-sqlite3` v13.0.3 with WAL journal mode (`PRAGMA journal_mode = WAL`).

### Tables & Schema
| Table Name | Columns | Row Count | Primary Key | Foreign Keys | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `products` | `id` (INTEGER), `name` (TEXT), `category` (TEXT), `price` (REAL), `description` (TEXT), `is_organic` (INTEGER) | **32** | `id` | None | **DONE** |
| `reviews` | `id` (INTEGER), `product_id` (INTEGER), `rating` (REAL), `reviewer_name` (TEXT), `review_text` (TEXT) | **102** | `id` (AUTOINCREMENT) | `product_id` ➔ `products(id)` | **DONE** |
| `orders` | `id` (INTEGER), `product_id` (INTEGER), `product_name` (TEXT), `price` (REAL), `ordered_at` (TEXT) | **4** (seeded + live test rows) | `id` (AUTOINCREMENT) | `product_id` ➔ `products(id)` | **DONE** |
| `sqlite_sequence`| `name` (TEXT), `seq` (INTEGER) | 2 | None | Internal SQLite sequence | **DONE** |

### Out-of-Stock Products Audit:
- **Finding**: In the schema provided by the mentor in `reference/setup_db.py`, the `products` table **does not have a `stock` column** (columns: `id, name, category, price, description, is_organic`).
- **Stock 0 Products**: **0 products have stock 0 in the database** because inventory counts are not modeled in the mentor's schema.
- **Out of stock handling**: The design screen `cartwise_out_of_stock_failure_3d` demonstrates an out-of-stock simulation. In the app, all 32 products in the database are currently active and available. Status: **PARTIAL** (Stock is unmodeled in mentor DB; simulated in design).

### Seeded Past Orders:
Orders currently present in `data/store.db`:
1. Order #7: `Organic Raw Honey` — $14.99 (`2026-05-13 21:10:53`)
2. Order #8: `Organic Acacia Honey` — $17.99 (`2026-10-01 15:05:45`)
3. Order #9: `Organic Flaxseed Oil` — $14.99 (`2026-10-01 15:40:52`)
4. Order #10: `Rolled Oats` — $5.49 (`2026-10-01 15:40:58`)

---

## 4. API Endpoints Audit

All 4 routes were tested against the active Next.js development server at `http://localhost:3000`.

| Route | Method | Parameters | Response Shape | Tested & Working | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | `q` (string), `category` (string), `is_organic` (boolean), `max_price` (number), `min_rating` (number), `id` (number) | `{ success: boolean, products: Product[], sql: string }` or `{ success: boolean, product: Product }` | Yes (`curl -s http://localhost:3000/api/products?category=honey`) | **DONE** |
| `/api/orders` | `GET` | None | `{ success: boolean, orders: Order[] }` | Yes (`curl -s http://localhost:3000/api/orders`) | **DONE** |
| `/api/orders` | `POST` | JSON: `{ productId: number }` | `{ success: boolean, order: Order }` | Yes (`curl -s -X POST http://localhost:3000/api/orders -d '{"productId":18}'`) | **DONE** |
| `/api/chat` | `POST` | JSON: `{ messages: ChatMessage[] }` | `{ success: boolean, message: AssistantMessage }` | Yes (`curl -s -X POST http://localhost:3000/api/chat -d '{"messages":[...]}'`) | **DONE** |
| `/api/image-search` | `POST` | JSON: `{ imageName: string }` or `multipart/form-data` with `file` | `{ success: boolean, message: AssistantMessage }` | Yes (`curl -s -X POST http://localhost:3000/api/image-search -d '{"imageName":"honey.png"}'`) | **DONE** |

All API routes return strict JSON responses and operate directly with SQLite via `lib/db.ts`.

---

## 5. Agent Layer Audit (`/lib/agent/`)

### Architecture
- **Unified Facade**: `lib/agent/index.ts` exposes two functions:
  - `handleChat(messages: ChatMessage[]): Promise<AssistantMessage>`
  - `handleImage(file: string | Buffer | File): Promise<AssistantMessage>`
- **Mode Switching (`AGENT_MODE`)**:
  - `AGENT_MODE=mock`: Routes execution to `lib/agent/mock.ts` (default).
  - `AGENT_MODE=real`: Routes to `lib/agent/real.ts`. If no LLM API key (`GROQ_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`) is found in environment variables, `handleRealChat` gracefully falls back to `handleMockChat` to guarantee truthful, non-hallucinated behavior. Status: **DONE** (Evidence: `lib/agent/real.ts:4-13`).

### What the Mock Can and Cannot Parse
#### What it parses successfully:
1. **Disambiguation / Clarify**: Queries with vague generic terms like `"honey"` trigger `{ type: "clarify", question: "...", options: [...] }`.
2. **Comparison Queries**: Matches `"compare"`, `"difference between ... oats"`, or `"steel-cut"` and `"rolled"` ➔ returns `{ type: "compare", products: [...], comparisonPoints: {...} }`.
3. **Honey with Filters**: Matches organic, rating thresholds (e.g. `"4.5+"`), and price caps (e.g. `"under $20"`, `"under $15"`) ➔ executes SQL with `HAVING average_rating >= 4.5 AND p.price <= 20` ➔ returns `{ type: "products", trace: {...} }`.
4. **Sleep & Tea Recommendations**: Matches `"sleep"` or `"tea"` + `"night"` ➔ finds Chamomile Tea (ID 22, rating 4.17).
5. **Breakfast Bundles**: Matches `"breakfast"` or `"morning"` ➔ returns 4 pantry items under $15 (Granola, Rolled Oats, Steel-Cut Oats, Quinoa).
6. **Oils Catalog**: Matches `"oil"`, `"olive"`, `"avocado"` ➔ returns culinary oils.
7. **Generic Database Search**: Falls back to `searchProducts({ query })` searching `name`, `description`, and `category` with SQL `LIKE %query%`.
8. **No Results / Empty State**: If no products match, returns `{ type: "empty_state", reason: "...", suggestions: [...] }`.

#### What the Mock cannot parse:
- Complex multi-clause natural language reasoning outside the predefined intent triggers (e.g., *"My daughter is allergic to tree nuts and wants high protein snacks under $8"*). In mock mode, this falls back to general substring matching on `products`. Status: **PARTIAL** (Deterministic mock engine by design; full NLP requires real LLM API key).

### Image Matching Mechanics
- The mock matches images based on the **filename or image label**:
  - `"elephant"` / `"animal"` / `"savannah"`: Triggers non-product fallback with animal tags (`Wildlife`, `African Elephant`) and an empty `matchedProducts: []`.
  - `"honey"`: Returns Organic Raw Honey (1), Wildflower Honey (2), and Orange Blossom Honey (6).
  - `"oat"` / `"grain"`: Returns Rolled Oats (18), Steel-Cut Oats (20), and Organic Granola (25).
  - `"oil"` / `"avocado"` / `"olive"`: Returns Avocado Oil (12) and Olive Oil (9).
  - Unrecognized file names: Fall back to generic product detection with recommendation.

### Structured Message Types & Example JSON Payloads

#### 1. `text`
```json
{
  "type": "text",
  "text": "Here is information regarding our organic store hours and certified sourcing practices."
}
```

#### 2. `products`
```json
{
  "type": "products",
  "text": "Found 4 verified organic honeys with 4.5+ rating under $20:",
  "products": [
    {
      "id": 1,
      "name": "Organic Raw Honey",
      "category": "honey",
      "price": 14.99,
      "description": "Pure organic raw honey, unfiltered and cold-pressed",
      "is_organic": true,
      "average_rating": 4.63,
      "review_count": 4,
      "image_url": "/images/honey.png"
    }
  ],
  "trace": {
    "query": "organic honey 4.5 under 20",
    "parsed_intent": "Search honey catalog with organic and price filters",
    "filters": { "keyword": "honey", "is_organic": true, "min_rating": 4.5, "max_price": 20 },
    "sql_query": "SELECT p.id, p.name FROM products p ... HAVING average_rating >= 4.5",
    "results_count": 4,
    "steps": [
      { "title": "Keyword Match", "detail": "Matched category 'honey'", "status": "complete" }
    ]
  }
}
```

#### 3. `clarify`
```json
{
  "type": "clarify",
  "question": "We carry 8 artisanal honeys in store! What kind of honey are you looking for?",
  "options": [
    "Certified Organic Raw Honey",
    "High Rating (4.5+ Stars)",
    "Under $15 Budget",
    "Light Floral Acacia Honey"
  ]
}
```

#### 4. `compare`
```json
{
  "type": "compare",
  "products": [
    { "id": 18, "name": "Rolled Oats", "price": 5.49 },
    { "id": 20, "name": "Steel-Cut Oats", "price": 6.99 }
  ],
  "comparisonPoints": {
    "Processing Method": ["De-husked, steamed, rolled flat", "Sliced with steel blades"],
    "Cooking Time": ["5 to 7 minutes on stove", "25 to 30 minutes simmering"],
    "Glycemic Index": ["Medium (approx 55)", "Low (approx 42-45)"]
  }
}
```

#### 5. `image_analysis`
```json
{
  "type": "image_analysis",
  "tags": ["Wildlife", "African Elephant", "Savannah Grassland", "Non-Product"],
  "description": "I couldn't identify any grocery product in this image. It appears to be an elephant walking across a savannah!",
  "matchedProducts": [],
  "uploadedImage": "elephant.png"
}
```

#### 6. `empty_state`
```json
{
  "type": "empty_state",
  "reason": "We couldn't find any products in our catalog matching \"imported truffles\".",
  "suggestions": [
    "Organic Raw Honey",
    "Organic Extra Virgin Olive Oil",
    "Rolled Oats"
  ]
}
```

---

## 6. Screens vs Design Matrix

Every folder in `/design` was audited against the built application components:

### Desktop Designs (`/design/Desktop/`)
| Folder Name | Implemented Component / Route | Fidelity | States Covered | Status |
| :--- | :--- | :--- | :--- | :--- |
| `cartwise_empty_chat_4a` | `components/chat/EmptyChatPrompt.tsx` | **Exact** | Empty chat state, 4 prompt cards, camera tip pill | **DONE** |
| `cartwise_thinking_state_4b` | `components/chat/ThinkingMessage.tsx` | **Exact** | Animated spinning icon, bouncing dots, step status | **DONE** |
| `cartwise_no_results_4c` | `components/chat/EmptyStateMessage.tsx` | **Close** | Empty state, reason, suggested product chips | **DONE** |
| `cartwise_search_error_4d` | `app/page.tsx:81-91` (catch handler) | **Close** | Error alert banner with retry suggestion | **DONE** |
| `cartwise_image_search_clear_match_1a` | `components/chat/ImageAnalysisMessage.tsx` | **Exact** | Upload preview, tags, matched catalog items | **DONE** |
| `cartwise_image_search_ambiguous_match_1b`| `components/chat/ImageAnalysisMessage.tsx` | **Close** | Multi-item match cards with tags | **DONE** |
| `cartwise_image_search_not_a_product_1c` | `components/chat/ImageAnalysisMessage.tsx` | **Exact** | Warning banner, non-grocery tags, zero items | **DONE** |
| `cartwise_compare_products_1d` | `components/chat/CompareMessage.tsx` | **Exact** | Side-by-side comparison table, ratings, Add buttons | **DONE** |
| `cartwise_cart_3a` | `components/cart/CartDrawer.tsx` | **Exact** | Step 1: Item list, quantity stepper, subtotal, tax, total | **DONE** |
| `cartwise_review_order_3b` | `components/cart/CartDrawer.tsx` | **Exact** | Step 2: Address, payment method, order summary, Place Order | **DONE** |
| `cartwise_order_confirmed_3c` | `components/cart/CartDrawer.tsx` | **Exact** | Step 3: Success checkmark, Order ID, timestamp | **DONE** |
| `cartwise_out_of_stock_failure_3d` | `components/cart/CartDrawer.tsx` | **Rough** | Design shows out-of-stock warning banner on order review; active DB has no stock column, so checkout directly succeeds | **PARTIAL** |
| `cartwise_your_orders` | `components/orders/OrdersView.tsx` | **Exact** | Past orders, search bar, Reorder button, status tags | **DONE** |
| `cartwise_ai_product_search_agent_trace` | `components/chat/AgentTraceModal.tsx` | **Exact** | Step inspector, active filters, executed SQL query | **DONE** |
| `organic_intelligence` | `app/globals.css` | **Exact** | Design tokens, color system, typography, shadows | **DONE** |

### Mobile Designs (`/design/Mobile/`)
| Folder Name | Implemented Component / Route | Fidelity | Responsive Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| `cartwise_mobile_empty_chat_1` | `components/chat/EmptyChatPrompt.tsx` | **Exact** | 1-column stacked cards, camera hint pill | **DONE** |
| `cartwise_mobile_ai_chat_product_carousel` | `components/chat/ProductsMessage.tsx` | **Close** | Responsive 1-column scrollable cards on mobile | **DONE** |
| `cartwise_mobile_thinking_state_2` | `components/chat/ThinkingMessage.tsx` | **Exact** | Full-width mobile thinking card | **DONE** |
| `cartwise_mobile_no_results_3` | `components/chat/EmptyStateMessage.tsx` | **Exact** | Stacked suggestion pills | **DONE** |
| `cartwise_mobile_search_error_4` | `app/page.tsx` | **Close** | Full-width alert container | **DONE** |
| `cartwise_mobile_vision_clear_match` | `components/chat/ImageAnalysisMessage.tsx` | **Exact** | Stacked thumbnail and analysis tags | **DONE** |
| `cartwise_mobile_vision_ambiguous_match` | `components/chat/ImageAnalysisMessage.tsx` | **Close** | Stacked tags with verified matches | **DONE** |
| `cartwise_mobile_vision_not_a_product` | `components/chat/ImageAnalysisMessage.tsx` | **Exact** | Amber warning banner with retry hint | **DONE** |
| `cartwise_mobile_compare_honeys` | `components/chat/CompareMessage.tsx` | **Close** | Horizontally scrollable comparison matrix (`overflow-x-auto`) | **DONE** |
| `cartwise_mobile_cart_1` | `components/cart/CartDrawer.tsx` | **Exact** | Full-screen mobile modal with sticky checkout button | **DONE** |
| `cartwise_mobile_review_order_2` | `components/cart/CartDrawer.tsx` | **Exact** | Mobile review order stepper & details | **DONE** |
| `cartwise_mobile_order_confirmed_3` | `components/cart/CartDrawer.tsx` | **Exact** | Centered mobile confirmation receipt | **DONE** |
| `cartwise_mobile_out_of_stock_4` | `components/cart/CartDrawer.tsx` | **Rough** | See desktop counterpart; unmodeled stock in mentor DB | **PARTIAL** |
| `cartwise_mobile_your_orders` | `components/orders/OrdersView.tsx` | **Exact** | Mobile order cards with Reorder button | **DONE** |
| `cartwise_mobile_navigation_drawer` | `components/Navbar.tsx` | **Exact** | Hamburger trigger and slide-down mobile nav drawer | **DONE** |

---

## 7. End-to-End User Flow Verifications

Tested across both Desktop (1280px) and Mobile (375px) viewports:

| Flow Description | Input / Action | Result | Desktop | Mobile | Reason / Notes | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Honey query (generic)** | Search `"honey"` | **PASS** | Yes | Yes | Correctly returns `ClarifyMessage` asking what kind of honey with 4 options | **DONE** |
| **"Show cheaper" / Budget chip** | Click `"Under $15 Budget"` pill | **PASS** | Yes | Yes | Queries honey with `max_price=15`, filters out higher-priced items | **DONE** |
| **"Only 4.7+" / High Rating chip**| Click `"High Rating (4.5+ Stars)"` pill | **PASS** | Yes | Yes | Filters database with `HAVING average_rating >= 4.5` | **DONE** |
| **Compare oats** | Prompt: `"Compare steel-cut oats and rolled oats"` | **PASS** | Yes | Yes | Generates side-by-side comparison matrix with cooking times, GI, and fiber | **DONE** |
| **Add to Cart** | Click `"Add to Cart"` on Product card | **PASS** | Yes | Yes | Cart badge increments; temporary `"Added"` checkmark appears; state saved in `localStorage` | **DONE** |
| **Change quantity** | Click `+` or `-` buttons in Cart Drawer | **PASS** | Yes | Yes | Updates line-item count, subtotal, 5% estimated tax, and total | **DONE** |
| **Checkout success** | Click `"Proceed to Checkout"` ➔ `"Place Order"` | **PASS** | Yes | Yes | Inserts into SQLite `orders` table; shows Order Confirmed screen with Order ID | **DONE** |
| **Out-of-stock failure** | Place order when item stock is 0 | **FAIL / N/A** | N/A | N/A | Mentor SQLite schema lacks `stock` column; orders always succeed | **PARTIAL** |
| **Honey image search** | Upload / Select `honey.png` | **PASS** | Yes | Yes | Returns visual tags (`Organic Raw Honey`, `Glass Jar`) and 3 matched products | **DONE** |
| **Oats image search** | Upload / Select `oats.png` | **PASS** | Yes | Yes | Identifies whole grains; matches Rolled Oats, Steel-Cut Oats, and Granola | **DONE** |
| **Elephant image search** | Upload / Select `elephant.png` | **PASS** | Yes | Yes | Correctly flags non-product warning; returns 0 products | **DONE** |
| **Reorder from past orders** | Click `"Reorder"` in Orders tab | **PASS** | Yes | Yes | Sends `product_id` to `/api/orders`, creates new order row in SQLite | **DONE** |
| **Agent Trace Panel** | Click `"Agent Trace"` or `"View Full Inspector"` | **PASS** | Yes | Yes | Modal displays parsed intent, active filters, and executed SQL query | **DONE** |

---

## 8. Known Problems, Bugs & Shortcuts

1. **Missing `stock` column in mentor database schema (`PARTIAL`):**
   - In `reference/setup_db.py`, the `products` table schema is strictly defined without a `stock` or `inventory` column. Because CartWise must never invent data outside the database (Rule #1), the out-of-stock failure flow shown in design `cartwise_out_of_stock_failure_3d` cannot occur dynamically from database queries unless an `ALTER TABLE products ADD COLUMN stock INTEGER` migration is executed.
2. **Hardcoded delivery address in checkout review:**
   - In `components/cart/CartDrawer.tsx:309-310`, the shipping address (`124 Botanical Way, San Francisco, CA`) is static in the UI to match the Stitch design mockups, as no user authentication or address database table was specified in the project requirements.
3. **Cart Checkout Item Ordering:**
   - When checking out multiple distinct cart items at once, `CartDrawer.tsx:56-62` submits the first item (`cart[0].product.id`) to `/api/orders` because the mentor's `orders` schema accepts a single `product_id` per order rather than an `order_items` join table.
4. **Mock Mode Image Recognition is Keyword/Filename-Based:**
   - In `lib/agent/mock.ts`, `handleMockImage` uses filename checks (`honey`, `oats`, `elephant`, `oil`). If a user uploads an image named `photo_123.jpg`, it falls back to the generic product match rather than performing true visual embeddings (which requires `AGENT_MODE=real` with an active vision LLM key).
5. **Titles and Buttons Safety:**
   - Names use `break-words` and no CSS truncations (`text-ellipsis` is explicitly avoided).
   - Button groups use `whitespace-nowrap` with flex shrink controls to prevent text wrapping.
   - Status: **DONE** (Complies with Rule #5).

---

## 9. Handover Risks for Future Developers

1. **Node Native Addon Compilation (`better-sqlite3`):**
   - `better-sqlite3` is a compiled C++ native addon. If another developer deploys to Vercel Serverless or Cloudflare Workers without a containerized environment (e.g. Docker / Node runtime), the native binding will throw an architecture mismatch error. For serverless deployments, consider SQLite via Turso (`@libsql/client`) or Prisma.
2. **Dual Database Paths (`data/store.db` vs `reference/store.db`):**
   - `lib/db.ts:48-51` checks `data/store.db` first, and falls back to `reference/store.db`. If a developer modifies `reference/store.db`, they must remember to delete or copy it to `data/store.db` so their local runtime picks up the changes.
3. **Next.js 16 Breaking Changes Warning:**
   - Next.js auto-injects agent rules in `AGENTS.md`. Both `AGENTS.md` and `TASKS.md` are added to `.gitignore` to prevent git tracking conflicts, but developers should be aware of Next.js 16 conventions (Turbopack, React 19 async request params).
4. **Zero Automated Unit/E2E Tests:**
   - Currently, there are no Jest/Vitest or Playwright automated test suites in the repository. All verifications have been conducted through API integration calls and manual browser testing. Writing an automated suite in Vitest is recommended.
