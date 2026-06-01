import { useUserStore } from "@/store/useUserStore";
import { formatTimestamp } from "@/lib/zodiacUtils";

interface ConversationHistoryProps {
  onClose?: () => void;
}

export default function ConversationHistory({ onClose }: ConversationHistoryProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    chartData,
  } = useUserStore();

  const handleNew = () => {
    createConversation();
    onClose?.();
  };

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-text-primary">Conversations</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleNew}
          className="amber-button w-full text-sm py-2.5"
        >
          ✦ New Reading
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-3xl mb-3 opacity-30">✦</div>
            <p className="text-text-muted text-sm">
              No conversations yet. Start a new reading to begin your cosmic journey.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-start justify-between gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  conv.id === activeConversationId
                    ? "bg-accent-glow border border-border-strong"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => handleSelect(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-body truncate ${
                      conv.id === activeConversationId
                        ? "text-accent"
                        : "text-text-primary"
                    }`}
                  >
                    {conv.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatTimestamp(conv.updatedAt)} · {conv.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-danger transition-all"
                  aria-label="Delete conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 3l-8 8M3 3l8 8" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Sun sign */}
      {chartData && (
        <div
          className="p-4 border-t border-border"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--border-strong)",
                color: "var(--accent)",
              }}
            >
              {["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"][
                ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].indexOf(chartData.sun_sign)
              ] || "☉"}
            </div>
            <div>
              <p className="text-sm text-text-primary font-body font-medium">
                {chartData.sun_sign} Sun
              </p>
              <p className="text-xs text-text-muted">
                {chartData.moon_sign} Moon · {chartData.rising_sign} Rising
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
