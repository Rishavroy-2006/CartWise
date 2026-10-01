"use client";

import React, { useState, useEffect, useRef } from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { ChatInput } from "@/components/ChatInput";
import { EmptyChatPrompt } from "@/components/chat/EmptyChatPrompt";
import { UserBubble } from "@/components/chat/UserBubble";
import { TextMessage } from "@/components/chat/TextMessage";
import { ProductsMessage } from "@/components/chat/ProductsMessage";
import { ImageAnalysisMessage } from "@/components/chat/ImageAnalysisMessage";
import { ClarifyMessage } from "@/components/chat/ClarifyMessage";
import { CompareMessage } from "@/components/chat/CompareMessage";
import { EmptyStateMessage } from "@/components/chat/EmptyStateMessage";
import { ThinkingMessage } from "@/components/chat/ThinkingMessage";
import { AgentTraceModal } from "@/components/chat/AgentTraceModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrdersView } from "@/components/orders/OrdersView";
import { ChatMessage, AssistantMessage, AgentTrace } from "@/lib/types";

function MainApp() {
  const { activeTab, selectedTrace, setSelectedTrace } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState("Searching organic catalog…");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    if (text.toLowerCase().includes("honey")) {
      setThinkingLabel("Finding organic honeys from local apiaries…");
    } else if (text.toLowerCase().includes("compare")) {
      setThinkingLabel("Synthesizing nutritional comparison matrix…");
    } else {
      setThinkingLabel("Searching organic grocery catalog…");
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          payload: data.message as AssistantMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // If trace is present, preserve it
        if ((data.message as any).trace) {
          setSelectedTrace((data.message as any).trace);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        payload: {
          type: "empty_state",
          reason: "An unexpected error occurred while communicating with the catalog. Please try again.",
          suggestions: ["Organic Raw Honey", "Rolled Oats", "Extra Virgin Olive Oil"],
        },
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendImage = async (imagePathOrFile: string | File) => {
    let imageUrl = "/images/honey.png";
    let imageName = "honey.png";

    if (typeof imagePathOrFile === "string") {
      imageName = imagePathOrFile;
      imageUrl = `/images/${imagePathOrFile}`;
    } else {
      imageName = imagePathOrFile.name;
      imageUrl = URL.createObjectURL(imagePathOrFile);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Searching by photo: ${imageName}`,
      image: imageUrl,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setThinkingLabel("Analyzing visual attributes & labels…");

    try {
      const res = await fetch("/api/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageName, url: imageUrl }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: "assistant",
          payload: data.message as AssistantMessage,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error("Image search error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      {/* Top Navbar */}
      <Navbar onNewChat={handleNewChat} onOpenTrace={() => setSelectedTrace(selectedTrace || {
        query: "Recent Agent Execution",
        parsed_intent: "Verified catalog retrieval with SQLite",
        filters: { keyword: "organic" },
        sql_query: "SELECT * FROM products WHERE is_organic = 1",
        steps: [
          { title: "Query Parsing", detail: "Parsed user search filters and intent", status: "complete" },
          { title: "Database Query", detail: "Scanned SQLite products with index lookups", status: "complete" },
          { title: "Review Aggregation", detail: "Aggregated customer ratings and star counts", status: "complete" }
        ]
      })} />

      {/* Main Content Area */}
      {activeTab === "orders" ? (
        <OrdersView />
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col">
            {messages.length === 0 ? (
              <EmptyChatPrompt onSelectPrompt={handleSendMessage} />
            ) : (
              <div className="space-y-6 flex-1">
                {messages.map((msg) => {
                  if (msg.role === "user") {
                    return <UserBubble key={msg.id} message={msg} />;
                  }

                  const { payload } = msg;

                  switch (payload.type) {
                    case "text":
                      return <TextMessage key={msg.id} text={payload.text} />;

                    case "products":
                      return (
                        <ProductsMessage
                          key={msg.id}
                          products={payload.products}
                          text={payload.text}
                          trace={payload.trace}
                          onOpenTrace={(trace) => setSelectedTrace(trace)}
                        />
                      );

                    case "image_analysis":
                      return (
                        <ImageAnalysisMessage
                          key={msg.id}
                          tags={payload.tags}
                          description={payload.description}
                          matchedProducts={payload.matchedProducts}
                          uploadedImage={payload.uploadedImage}
                          onOpenTrace={(trace) => setSelectedTrace(trace)}
                        />
                      );

                    case "clarify":
                      return (
                        <ClarifyMessage
                          key={msg.id}
                          question={payload.question}
                          options={payload.options}
                          onSelectOption={handleSendMessage}
                        />
                      );

                    case "compare":
                      return (
                        <CompareMessage
                          key={msg.id}
                          products={payload.products}
                          comparisonPoints={payload.comparisonPoints}
                        />
                      );

                    case "empty_state":
                      return (
                        <EmptyStateMessage
                          key={msg.id}
                          reason={payload.reason}
                          suggestions={payload.suggestions}
                          onSelectSuggestion={handleSendMessage}
                        />
                      );

                    default:
                      return null;
                  }
                })}

                {isLoading && <ThinkingMessage label={thinkingLabel} />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          {/* Sticky Bottom Chat Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onSendImage={handleSendImage}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Global Modals */}
      <CartDrawer />
      <AgentTraceModal
        trace={selectedTrace}
        onClose={() => setSelectedTrace(null)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
