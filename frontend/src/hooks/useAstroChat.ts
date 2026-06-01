import { useState, useCallback, useRef } from "react";
import { streamChat, ChatSSEEvent } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export function useAstroChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const {
    activeConversationId,
    chartData,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    addToolCallToLastMessage,
    updateToolCallStatus,
  } = useUserStore();

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      abortRef.current = false;

      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      // Add user message
      const userMsg = {
        id: `msg-${Date.now()}-user`,
        role: "user" as const,
        content,
        timestamp: Date.now(),
      };
      addMessage(convId, userMsg);

      // Add empty assistant message placeholder
      const assistantMsg = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant" as const,
        content: "",
        timestamp: Date.now(),
        toolCalls: [],
      };
      addMessage(convId, assistantMsg);

      setIsStreaming(true);
      let fullText = "";

      try {
        const stream = streamChat(
          content,
          chartData?.chart_id || null,
          convId
        );

        for await (const event of stream) {
          if (abortRef.current) break;

          switch (event.type) {
            case "text":
              fullText += event.content;
              updateLastAssistantMessage(convId, fullText);
              break;

            case "tool_call":
              addToolCallToLastMessage(convId, event.content, "pending");
              break;

            case "tool_result":
              // Find the pending tool and mark complete
              updateToolCallStatus(convId, event.content.split(" ")[0], "complete");
              // Also try to match by the tool_call content that was set earlier
              const store = useUserStore.getState();
              const conv = store.conversations.find((c) => c.id === convId);
              if (conv) {
                const lastMsg = conv.messages[conv.messages.length - 1];
                if (lastMsg?.toolCalls) {
                  const pendingTool = lastMsg.toolCalls.find(
                    (t) => t.status === "pending"
                  );
                  if (pendingTool) {
                    updateToolCallStatus(convId, pendingTool.name, "complete");
                  }
                }
              }
              break;

            case "done":
              break;
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [
      activeConversationId,
      chartData,
      createConversation,
      addMessage,
      updateLastAssistantMessage,
      addToolCallToLastMessage,
      updateToolCallStatus,
    ]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
  }, []);

  const retry = useCallback(
    (lastMessage: string) => {
      setError(null);
      sendMessage(lastMessage);
    },
    [sendMessage]
  );

  return { sendMessage, isStreaming, error, stopStreaming, retry };
}
