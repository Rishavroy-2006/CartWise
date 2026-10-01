import { handleMockChat, handleMockImage } from "./mock";
import { handleRealChat, handleRealImage } from "./real";
import { AssistantMessage, ChatMessage } from "../types";

export async function handleChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const mode = (process.env.AGENT_MODE || "mock").toLowerCase();
  if (mode === "real") {
    return handleRealChat(messages);
  }
  return handleMockChat(messages);
}

export async function handleImage(file: string | Buffer | File): Promise<AssistantMessage> {
  const mode = (process.env.AGENT_MODE || "mock").toLowerCase();
  if (mode === "real") {
    return handleRealImage(file);
  }
  return handleMockImage(file);
}
