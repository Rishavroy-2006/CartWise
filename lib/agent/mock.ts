import { searchProducts, getProductById, SearchProductsOptions } from "../db";
import { AssistantMessage, ChatMessage, Product, AgentTrace } from "../types";

export async function handleMockChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUserMessage) {
    return {
      type: "empty_state",
      reason: "No query provided.",
      suggestions: ["Organic Raw Honey", "Extra Virgin Olive Oil", "Steel-Cut Oats"],
    };
  }

  const query = lastUserMessage.content.toLowerCase().trim();

  // 1. Check for Comparison query
  if (
    query.includes("compare") ||
    (query.includes("steel-cut") && query.includes("rolled")) ||
    (query.includes("difference between") && query.includes("oats"))
  ) {
    const rolledOats = getProductById(18); // Rolled Oats
    const steelCutOats = getProductById(20); // Steel-Cut Oats

    if (rolledOats && steelCutOats) {
      return {
        type: "compare",
        products: [rolledOats, steelCutOats],
        comparisonPoints: {
          "Processing Method": [
            "De-husked, steamed, and rolled flat with steel rollers",
            "Whole groats sliced into 2-3 pieces with sharp steel blades"
          ],
          "Cooking Time": [
            "5 to 7 minutes on stove (or 2 mins microwave)",
            "25 to 30 minutes simmering on low heat"
          ],
          "Texture & Mouthfeel": [
            "Soft, smooth, creamy porridge consistency",
            "Chewy, hearty, dense, with a distinctive nutty bite"
          ],
          "Glycemic Index": [
            "Medium (approx 55) — quicker digestion",
            "Low (approx 42-45) — slow, sustained glucose release"
          ],
          "Dietary Fiber": [
            "4g per 40g serving (soluble beta-glucan)",
            "5g per 40g serving (higher intact kernel fiber)"
          ],
          "Best Culinary Use": [
            "Overnight oats, quick breakfast bowls, baking cookies",
            "Warm rustic savory bowls, slow-cooker batch breakfasts"
          ]
        }
      };
    }
  }

  // 2. Check for Sleep / Tea recommendation
  if (query.includes("sleep") || (query.includes("tea") && query.includes("night"))) {
    const chamomile = getProductById(22);
    if (chamomile) {
      return {
        type: "products",
        text: "For restful sleep, Chamomile Tea is our top recommendation — it is naturally caffeine-free and made from whole dried chamomile flowers.",
        products: [chamomile],
        trace: {
          query: lastUserMessage.content,
          parsed_intent: "Find natural sleep aid or caffeine-free herbal tea",
          filters: { keyword: "chamomile", is_organic: false },
          sql_query: "SELECT * FROM products WHERE name LIKE '%chamomile%'",
          results_count: 1,
          steps: [
            { title: "Query Analysis", detail: "Parsed intent: sleep-supporting herbal infusions", status: "complete" },
            { title: "Database Query", detail: "Matched Chamomile Tea (ID: 22) in tea category", status: "complete" },
            { title: "Review Aggregation", detail: "Verified 4.17 average rating across customer reviews", status: "complete" },
          ]
        }
      };
    }
  }

  // 3. Check for Breakfast bundle / healthy breakfast
  if (query.includes("breakfast") || (query.includes("healthy") && query.includes("morning"))) {
    const oats1 = getProductById(18); // Rolled Oats
    const oats2 = getProductById(20); // Steel-Cut Oats
    const granola = getProductById(25); // Organic Granola
    const quinoa = getProductById(17); // Organic Quinoa

    const products = [granola, oats1, oats2, quinoa].filter(Boolean) as Product[];

    return {
      type: "products",
      text: "Here are 4 wholesome breakfast staples verified under $15 in our pantry aisle:",
      products,
      trace: {
        query: lastUserMessage.content,
        parsed_intent: "Retrieve healthy breakfast items under $15",
        filters: { max_price: 15 },
        sql_query: "SELECT * FROM products WHERE (category = 'grains' OR category = 'snacks') AND price <= 15",
        results_count: products.length,
        steps: [
          { title: "Category Mapping", detail: "Scanned grains and snacks categories for morning items", status: "complete" },
          { title: "Price Cap Enforcement", detail: "Strictly filtered items under $15.00", status: "complete" },
          { title: "Nutritional Sort", detail: "Prioritized whole grain and organic verified staples", status: "complete" }
        ]
      }
    };
  }

  // 4. Check for Honey specific search (e.g. "organic honey with 4.5+ rating under $20" or "under 20")
  if (query.includes("honey")) {
    const isOrganic = query.includes("organic");
    const minRating = query.includes("4.5") ? 4.5 : query.includes("4") ? 4.0 : undefined;
    const maxPrice = query.includes("20") ? 20 : query.includes("15") ? 15 : undefined;

    // If query is just vague "honey", return clarify message
    if (!isOrganic && minRating === undefined && maxPrice === undefined && query.length < 15) {
      return {
        type: "clarify",
        question: "We carry 8 artisanal honeys in store! What kind of honey are you looking for?",
        options: [
          "Certified Organic Raw Honey",
          "High Rating (4.5+ Stars)",
          "Under $15 Budget",
          "Light Floral Acacia Honey"
        ]
      };
    }

    const { products, sql } = searchProducts({
      query: "honey",
      isOrganic: isOrganic ? true : undefined,
      minRating,
      maxPrice
    });

    if (products.length === 0) {
      return {
        type: "empty_state",
        reason: "No honeys matched your exact filters. Try adjusting price or rating criteria.",
        suggestions: ["Organic Raw Honey ($14.99)", "Wildflower Honey ($12.99)", "Organic Acacia Honey ($17.99)"]
      };
    }

    return {
      type: "products",
      text: `Found ${products.length} verified ${isOrganic ? "organic " : ""}honeys${minRating ? ` with ${minRating}+ rating` : ""}${maxPrice ? ` under $${maxPrice}` : ""}:`,
      products,
      trace: {
        query: lastUserMessage.content,
        parsed_intent: "Search honey catalog with organic and price filters",
        filters: { keyword: "honey", is_organic: isOrganic, min_rating: minRating, max_price: maxPrice },
        sql_query: sql.trim(),
        results_count: products.length,
        steps: [
          { title: "Keyword Match", detail: "Matched category 'honey' and query term 'honey'", status: "complete" },
          { title: "Organic Filtering", detail: isOrganic ? "Applied is_organic = 1 constraint" : "Included all production types", status: "complete" },
          { title: "Rating Aggregation", detail: `Calculated average reviews with HAVING average_rating >= ${minRating || 0}`, status: "complete" }
        ]
      }
    };
  }

  // 5. Check for Oils search
  if (query.includes("oil") || query.includes("olive") || query.includes("avocado")) {
    const isOrganic = query.includes("organic");
    const { products, sql } = searchProducts({
      category: "oil",
      isOrganic: isOrganic ? true : undefined
    });

    return {
      type: "products",
      text: `Here are the cold-pressed culinary oils available in our store:`,
      products,
      trace: {
        query: lastUserMessage.content,
        parsed_intent: "Retrieve cooking and culinary oils",
        filters: { keyword: "oil" },
        sql_query: sql.trim(),
        results_count: products.length,
        steps: [
          { title: "Category Search", detail: "Selected items where category = 'oil'", status: "complete" },
          { title: "Purity Check", detail: "Verified cold-pressed certifications and origin details", status: "complete" }
        ]
      }
    };
  }

  // 6. Generic database search fallback
  const { products, sql } = searchProducts({ query });

  if (products.length > 0) {
    return {
      type: "products",
      text: `Found ${products.length} item${products.length > 1 ? "s" : ""} matching "${lastUserMessage.content}":`,
      products,
      trace: {
        query: lastUserMessage.content,
        parsed_intent: "General keyword search",
        filters: { keyword: query },
        sql_query: sql.trim(),
        results_count: products.length,
        steps: [
          { title: "Text Search", detail: `Queried name, description, and category for '${query}'`, status: "complete" }
        ]
      }
    };
  }

  // 7. No results empty state
  return {
    type: "empty_state",
    reason: `We couldn't find any products in our catalog matching "${lastUserMessage.content}".`,
    suggestions: [
      "Organic Raw Honey",
      "Organic Extra Virgin Olive Oil",
      "Rolled Oats",
      "Organic Almonds",
      "Chamomile Tea"
    ]
  };
}

export async function handleMockImage(imageInput: string | Buffer | File): Promise<AssistantMessage> {
  const imageName = typeof imageInput === "string" ? imageInput.toLowerCase() : "";

  // 1. Non-product image detection (elephant)
  if (imageName.includes("elephant") || imageName.includes("savannah") || imageName.includes("animal")) {
    return {
      type: "image_analysis",
      tags: ["Wildlife", "African Elephant", "Savannah Grassland", "Non-Product"],
      description: "I couldn't identify any grocery product in this image. It appears to be an elephant walking across a savannah! Please upload a photo of a pantry staple, package, or grocery label.",
      matchedProducts: [],
      uploadedImage: typeof imageInput === "string" ? imageInput : "/images/elephant.png"
    };
  }

  // 2. Honey image detection
  if (imageName.includes("honey")) {
    const rawHoney = getProductById(1);
    const wildflowerHoney = getProductById(2);
    const orangeHoney = getProductById(6);

    const matches = [rawHoney, wildflowerHoney, orangeHoney].filter(Boolean) as Product[];

    return {
      type: "image_analysis",
      tags: ["Organic Raw Honey", "Glass Jar", "Artisanal", "Unfiltered"],
      description: "Visual analysis identified a glass jar of artisanal organic raw honey. 3 matching items found in the honey aisle.",
      matchedProducts: matches,
      uploadedImage: typeof imageInput === "string" ? imageInput : "/images/honey.png"
    };
  }

  // 3. Oats image detection
  if (imageName.includes("oat") || imageName.includes("grain")) {
    const rolledOats = getProductById(18);
    const steelCutOats = getProductById(20);
    const granola = getProductById(25);

    const matches = [rolledOats, steelCutOats, granola].filter(Boolean) as Product[];

    return {
      type: "image_analysis",
      tags: ["Whole Grain Oats", "Pantry Jar", "Fiber Rich", "Breakfast Grains"],
      description: "Visual analysis detected whole grain oat cereals. Matched with 3 grain products in our store catalog.",
      matchedProducts: matches,
      uploadedImage: typeof imageInput === "string" ? imageInput : "/images/oats.png"
    };
  }

  // 4. Oil image detection
  if (imageName.includes("oil") || imageName.includes("avocado") || imageName.includes("olive")) {
    const avocadoOil = getProductById(12);
    const oliveOil = getProductById(9);

    const matches = [avocadoOil, oliveOil].filter(Boolean) as Product[];

    return {
      type: "image_analysis",
      tags: ["Cold-Pressed Cooking Oil", "Glass Bottle", "Culinary Oil"],
      description: "Visual match identified culinary bottle of cold-pressed oil. Found 2 matching premium oils in stock.",
      matchedProducts: matches,
      uploadedImage: typeof imageInput === "string" ? imageInput : "/images/avocado_oil.png"
    };
  }

  // Generic product detection fallback
  const rawHoney = getProductById(1);
  return {
    type: "image_analysis",
    tags: ["Pantry Product", "Grocery Item", "Organic Label"],
    description: "Visual match identified a grocery product. Showing top recommendations from our catalog.",
    matchedProducts: rawHoney ? [rawHoney] : [],
    uploadedImage: typeof imageInput === "string" ? imageInput : "/images/honey.png"
  };
}
