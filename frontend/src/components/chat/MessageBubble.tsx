import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@/store/useUserStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const THINKING_STEPS = [
  "Gathering Relevant Context",
  "Consulting Ephemeris Data",
  "Analyzing Astrological Alignments",
  "Synthesizing Interpretation",
  "Finalizing Insights"
];

function ThinkingStatus() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % THINKING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-accent ml-2 font-normal flex items-center gap-1">
      <span className="flex gap-0.5">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
      </span>
      <span className="animate-pulse">{THINKING_STEPS[step]}</span>
    </span>
  );
}

function useSmoothStream(targetText: string, isStreaming: boolean, speed: number = 3) {
  const [displayedText, setDisplayedText] = useState(targetText);
  const indexRef = useRef(targetText.length);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(targetText);
      indexRef.current = targetText.length;
      return;
    }

    if (targetText.length < indexRef.current) {
      setDisplayedText(targetText);
      indexRef.current = targetText.length;
      return;
    }

    if (indexRef.current === targetText.length) {
      return;
    }

    const interval = setInterval(() => {
      indexRef.current += speed;
      if (indexRef.current >= targetText.length) {
        indexRef.current = targetText.length;
        setDisplayedText(targetText);
        clearInterval(interval);
      } else {
        setDisplayedText(targetText.substring(0, indexRef.current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [targetText, isStreaming, speed]);

  return displayedText;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const smoothedContent = useSmoothStream(message.content, !!isStreaming && !isUser);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] ${isUser ? "rounded-2xl rounded-br-sm px-5 py-4" : "py-2 px-1"
          }`}
        style={
          isUser
            ? {
              background: "rgba(245, 166, 35, 0.12)",
              border: "1px solid rgba(245, 166, 35, 0.2)",
            }
            : {
              background: "transparent",
              border: "none",
            }
        }
      >
        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-4 pb-3 border-b border-white/5 space-y-2">
            {message.toolCalls.map((tool, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-sm"
              >
                {tool.status === "pending" ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                  />
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
                  </svg>
                )}
                <span
                  className="font-body italic"
                  style={{
                    color:
                      tool.status === "pending"
                        ? "var(--accent)"
                        : "var(--text-muted)",
                  }}
                >
                  {tool.status === "pending" ? `Running ${tool.name}...` : `Completed ${tool.name}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div
          className={`text-sm leading-relaxed font-body prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 text-text-primary ${isStreaming && !smoothedContent ? "typing-cursor" : ""}`}
        >
          {smoothedContent ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {smoothedContent}
            </ReactMarkdown>
          ) : (
            isStreaming ? <ThinkingStatus /> : "..."
          )}
          {isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-accent animate-pulse" />
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`mt-2 text-xs ${isUser ? "text-accent/50 text-right" : "text-text-muted"
            }`}
        >
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
