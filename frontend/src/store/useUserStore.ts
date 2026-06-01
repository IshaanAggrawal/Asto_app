import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChartData, ZodiacSign } from "@/lib/constants";
import { generateConversationId } from "@/lib/zodiacUtils";

/* ── Types ────────────────────────────────────────────── */

export interface BirthDetails {
  name: string;
  dob: string;
  tob: string | null;
  place: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  toolCalls?: { name: string; status: "pending" | "complete" }[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/* ── Store ────────────────────────────────────────────── */

interface UserStore {
  // Birth details
  birthDetails: BirthDetails | null;
  setBirthDetails: (details: BirthDetails) => void;
  clearBirthDetails: () => void;

  // Chart data
  chartData: ChartData | null;
  setChartData: (data: ChartData) => void;

  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateLastAssistantMessage: (conversationId: string, content: string) => void;
  addToolCallToLastMessage: (
    conversationId: string,
    toolName: string,
    status: "pending" | "complete"
  ) => void;
  updateToolCallStatus: (
    conversationId: string,
    toolName: string,
    status: "pending" | "complete"
  ) => void;
  deleteConversation: (id: string) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  birthBannerDismissed: boolean;
  dismissBirthBanner: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      /* ── Birth details ──────────────────────────────── */
      birthDetails: null,
      setBirthDetails: (details) => set({ birthDetails: details }),
      clearBirthDetails: () => set({ birthDetails: null, chartData: null }),

      /* ── Chart data ─────────────────────────────────── */
      chartData: null,
      setChartData: (data) => set({ chartData: data }),

      /* ── Conversations ──────────────────────────────── */
      conversations: [],
      activeConversationId: null,

      createConversation: () => {
        const id = generateConversationId();
        const conv: Conversation = {
          id,
          title: "New Reading",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            // Auto-title from first user message
            const title =
              c.messages.length === 0 && message.role === "user"
                ? message.content.slice(0, 40) + (message.content.length > 40 ? "…" : "")
                : c.title;
            return {
              ...c,
              title,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
            };
          }),
        })),

      updateLastAssistantMessage: (conversationId, content) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
              msgs[lastIdx] = { ...msgs[lastIdx], content };
            }
            return { ...c, messages: msgs, updatedAt: Date.now() };
          }),
        })),

      addToolCallToLastMessage: (conversationId, toolName, status) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
              const existing = msgs[lastIdx].toolCalls || [];
              msgs[lastIdx] = {
                ...msgs[lastIdx],
                toolCalls: [...existing, { name: toolName, status }],
              };
            }
            return { ...c, messages: msgs };
          }),
        })),

      updateToolCallStatus: (conversationId, toolName, status) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
              const tools = (msgs[lastIdx].toolCalls || []).map((t) =>
                t.name === toolName ? { ...t, status } : t
              );
              msgs[lastIdx] = { ...msgs[lastIdx], toolCalls: tools };
            }
            return { ...c, messages: msgs };
          }),
        })),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId:
            s.activeConversationId === id ? null : s.activeConversationId,
        })),

      /* ── UI state ───────────────────────────────────── */
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      birthBannerDismissed: false,
      dismissBirthBanner: () => set({ birthBannerDismissed: true }),
    }),
    {
      name: "astroagent-store",
      partialize: (state) => ({
        birthDetails: state.birthDetails,
        chartData: state.chartData,
        conversations: state.conversations,
        birthBannerDismissed: state.birthBannerDismissed,
      }),
    }
  )
);
