# CartWise — Agent Rules & System Guidelines

## Core System Architecture & Project Principles

1. **Screen Fidelity & Truthful Data:**
   - Strictly match the screens in `/design`.
   - Use **only** the data in the SQLite database.
   - **Never invent** products, prices, ratings, deals, tax, addresses, or payments.

2. **Structured Assistant Messages:**
   - The assistant returns **STRUCTURED** messages, never formatted plain text.
   - Message schema:
     ```typescript
     type AssistantMessage =
       | { type: "text"; text: string }
       | { type: "products"; products: Product[]; text?: string }
       | { type: "image_analysis"; tags: string[]; description: string; matchedProducts?: Product[] }
       | { type: "clarify"; question: string; options: string[] }
       | { type: "compare"; products: Product[]; comparisonPoints: Record<string, string[]> }
       | { type: "empty_state"; reason: string; suggestions?: string[] };
     ```
   - Each message type has its own dedicated React component in the chat UI.

3. **Deterministic ID Actions:**
   - "Buy" and "Add to cart" buttons send `product_id` straight to the API.
   - The AI agent never invents or arbitrarily decides a product ID.

4. **Agent Logic Boundary:**
   - ALL agent logic lives in `/lib/agent/` behind unified entry points:
     - `handleChat(messages: ChatMessage[]): Promise<AssistantMessage>`
     - `handleImage(file: File | Buffer | Blob): Promise<AssistantMessage>`
   - A configuration flag `AGENT_MODE=mock|real` switches implementations.
   - `AGENT_MODE=mock` is the default.

5. **UI & Layout Constraints:**
   - Product names are never truncated.
   - Buttons never wrap awkwardly.
   - The chat input bar must never cover message content or overflow.
   - Both desktop and mobile views are strictly required.

6. **Mobile Web Fix — iOS Zoom-on-Refresh:**
   - Always include the exact viewport meta tag:
     `<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, shrink-to-fit=no" />`
   - Apply `overflow-x: hidden` and `max-width: 100%` on `html`, and `overflow-x: hidden` on `body`.

7. **Task Tracking:**
   - Maintain a living `TASKS.md` checklist and tick items off systematically upon completion.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
