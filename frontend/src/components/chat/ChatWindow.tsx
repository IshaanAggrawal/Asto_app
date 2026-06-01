import { useRef, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import MessageBubble from "./MessageBubble";
import LoadingOrbs from "@/components/shared/LoadingOrbs";

interface ChatWindowProps {
  isStreaming: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function ChatWindow({ isStreaming, error, onRetry }: ChatWindowProps) {
  const { activeConversationId, conversations } = useUserStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConv?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (!activeConversationId || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Decorative */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{ border: "1px solid var(--border-strong)" }}
            />
            <div
              className="absolute inset-3 rounded-full"
              style={{
                border: "1px solid var(--border)",
                animation: "spin 25s linear infinite reverse",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-3xl text-accent opacity-60">
              ✦
            </div>
          </div>

          <h3 className="font-display text-2xl text-text-primary mb-3">
            Ask the Stars
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            Begin a conversation with your personal AI astrologer. Ask about
            your birth chart, current transits, relationships, career — the
            cosmos is listening.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isStreamingMsg =
            isLast && msg.role === "assistant" && isStreaming;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreamingMsg}
            />
          );
        })}

        {/* Loading orbs when starting stream */}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <LoadingOrbs />}

        {/* Error state */}
        {error && (
          <div
            className="mb-4 p-4 rounded-xl text-sm"
            style={{
              background: "rgba(224, 92, 92, 0.1)",
              border: "1px solid rgba(224, 92, 92, 0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-danger text-lg">⚠</span>
              <div className="flex-1">
                <p className="text-danger font-body font-medium mb-1">
                  Something went wrong
                </p>
                <p className="text-text-secondary text-xs">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-2 text-xs font-body font-medium text-accent hover:underline"
                  >
                    Try again →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
