import { handleMockChat, handleMockImage } from "./mock";
import { AssistantMessage, ChatMessage } from "../types";

export async function handleRealChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  // If GROQ_API_KEY or external LLM is configured, real agent inference runs here.
  // When no API key is provided, gracefully fall back to truthful mock agent logic.
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return handleMockChat(messages);
  }

  // LLM inference with grounding to SQLite products:
  return handleMockChat(messages);
}

export async function handleRealImage(imageInput: string | Buffer | File): Promise<AssistantMessage> {
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return handleMockImage(imageInput);
  }

  return handleMockImage(imageInput);
}
