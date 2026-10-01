export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  is_organic: boolean;
  average_rating?: number;
  review_count?: number;
  image_url?: string;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  reviewer_name: string;
  review_text: string;
}

export interface Order {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  ordered_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AgentTraceStep {
  title: string;
  detail: string;
  status: "complete" | "running" | "failed";
}

export interface AgentTrace {
  query?: string;
  parsed_intent?: string;
  filters?: {
    keyword?: string;
    max_price?: number;
    is_organic?: boolean;
    min_rating?: number;
  };
  sql_query?: string;
  results_count?: number;
  steps: AgentTraceStep[];
}

export type AssistantMessage =
  | { type: "text"; text: string }
  | { type: "products"; products: Product[]; text?: string; trace?: AgentTrace }
  | { type: "image_analysis"; tags: string[]; description: string; matchedProducts?: Product[]; uploadedImage?: string }
  | { type: "clarify"; question: string; options: string[] }
  | { type: "compare"; products: Product[]; comparisonPoints: Record<string, string[]> }
  | { type: "empty_state"; reason: string; suggestions?: string[] };

export interface UserChatMessage {
  id: string;
  role: "user";
  content: string;
  image?: string;
  timestamp: number;
}

export interface AssistantChatMessage {
  id: string;
  role: "assistant";
  payload: AssistantMessage;
  timestamp: number;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;
