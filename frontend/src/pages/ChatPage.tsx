import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useAstroChat } from "@/hooks/useAstroChat";
import ConversationHistory from "@/components/chat/ConversationHistory";
import ChatWindow from "@/components/chat/ChatWindow";
import PromptBox from "@/components/chat/PromptBox";

export default function ChatPage() {
  const {
    birthDetails,
    activeConversationId,
    conversations,
    birthBannerDismissed,
    dismissBirthBanner,
    sidebarOpen,
    setSidebarOpen,
  } = useUserStore();

  const { sendMessage, isStreaming, error, retry } = useAstroChat();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const hasMessages = (activeConv?.messages.length || 0) > 0;

  const handleRetry = useCallback(() => {
    if (!activeConv) return;
    const lastUserMsg = [...activeConv.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      retry(lastUserMsg.content);
    }
  }, [activeConv, retry]);

  return (
    <div
      className="flex h-screen pt-16 overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Desktop sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block border-r border-border overflow-hidden shrink-0"
            style={{ background: "var(--bg-surface)" }}
          >
            <ConversationHistory />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-16 bottom-0 w-[280px] z-50 lg:hidden border-r border-border"
              style={{ background: "var(--bg-surface)" }}
            >
              <ConversationHistory onClose={() => setMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-text-muted hover:text-accent transition-colors"
              aria-label="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h14M3 5h14M3 15h14" />
              </svg>
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 text-text-muted hover:text-accent transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h14M3 5h14M3 15h14" />
              </svg>
            </button>

            <h2 className="font-display text-sm text-text-primary truncate">
              {activeConv?.title || "New Reading"}
            </h2>
          </div>

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-accent">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--accent)" }}
              />
              Receiving...
            </div>
          )}
        </div>

        {/* Birth details banner */}
        {!birthDetails && !birthBannerDismissed && (
          <div
            className="flex items-center justify-between px-4 py-2.5 text-sm shrink-0"
            style={{
              background: "var(--accent-glow)",
              borderBottom: "1px solid var(--border-strong)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-accent">☉</span>
              <p className="text-text-primary font-body">
                <Link to="/onboard" className="text-accent hover:underline font-medium">
                  Add your birth details
                </Link>{" "}
                for a personalized reading
              </p>
            </div>
            <button
              onClick={dismissBirthBanner}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
          </div>
        )}

        {/* User info banner */}
        {birthDetails && !birthBannerDismissed && (
          <div
            className="flex items-center justify-between px-4 py-2 text-sm shrink-0"
            style={{
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2 text-text-secondary font-body">
              <span className="zodiac-glyph text-sm">☉</span>
              <span>{birthDetails.name}</span>
              {useUserStore.getState().chartData && (
                <span className="text-text-muted">
                  · {useUserStore.getState().chartData!.sun_sign} Sun
                </span>
              )}
            </div>
            <button
              onClick={dismissBirthBanner}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
          </div>
        )}

        {/* Chat window */}
        <ChatWindow
          isStreaming={isStreaming}
          error={error}
          onRetry={handleRetry}
        />

        {/* Prompt box */}
        <PromptBox
          onSend={sendMessage}
          isStreaming={isStreaming}
          showChips={!hasMessages}
        />
      </div>
    </div>
  );
}
