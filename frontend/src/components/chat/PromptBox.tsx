import { useState, useRef, useEffect, useCallback } from "react";
import { QUICK_ASK_CHIPS } from "@/lib/constants";

interface PromptBoxProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  showChips?: boolean;
}

export default function PromptBox({ onSend, isStreaming, showChips = false }: PromptBoxProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 500;

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = 4 * 24; // ~4 lines
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [value]);

  return (
    <div className="border-t border-border p-4" style={{ background: "var(--bg-surface)" }}>
      {/* Quick-ask chips */}
      {showChips && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_ASK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setValue(chip);
                onSend(chip);
              }}
              className="text-xs px-3 py-1.5 rounded-full font-body transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--border-strong)",
                color: "var(--accent)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className="flex items-end gap-3 rounded-xl px-4 py-3 transition-all duration-300"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? "Awaiting the stars..." : "Ask the stars anything..."}
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-text-primary placeholder:text-text-muted font-body leading-6 disabled:opacity-50"
        />

        <div className="flex items-center gap-2 shrink-0">
          {/* Character count */}
          {value.length > 200 && (
            <span
              className="text-xs font-mono"
              style={{
                color: value.length > maxChars - 50 ? "var(--danger)" : "var(--text-muted)",
              }}
            >
              {value.length}/{maxChars}
            </span>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isStreaming}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                value.trim() && !isStreaming
                  ? "linear-gradient(135deg, var(--accent), var(--accent-dim))"
                  : "var(--bg-surface)",
              boxShadow:
                value.trim() && !isStreaming
                  ? "0 2px 10px rgba(245, 166, 35, 0.3)"
                  : "none",
            }}
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke={value.trim() && !isStreaming ? "var(--bg-base)" : "var(--text-muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 12V4M4 8l4-4 4 4" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-2 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
