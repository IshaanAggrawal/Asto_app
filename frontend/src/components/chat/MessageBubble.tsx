import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@/store/useUserStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ROUTER_STEPS = [
  "Assessing the Prompt",
  "Analyzing Intent",
  "Selecting Astrology Tools",
];

const REASONER_STEPS = [
  "Gathering Relevant Context",
  "Fetching Vector DB",
  "Consulting Ephemeris Data",
  "Analyzing Astrological Alignments",
  "Synthesizing Interpretation",
  "Finalizing Insights"
];

function ThinkingStatus({ isRouter }: { isRouter: boolean }) {
  const [step, setStep] = useState(0);
  const steps = isRouter ? ROUTER_STEPS : REASONER_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <span className="text-accent ml-2 font-normal flex items-center gap-1">
      <span className="flex gap-0.5">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{animationDelay: "0.1s"}}>.</span>
        <span className="animate-bounce" style={{animationDelay: "0.2s"}}>.</span>
      </span> 
      <span className="animate-pulse">{steps[step]}</span>
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
        className={`max-w-[85%] md:max-w-[75%] ${
          isUser ? "rounded-2xl rounded-br-sm px-5 py-4" : "py-2 px-1"
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
          className={`text-sm leading-relaxed font-body prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 ${isUser ? "text-text-primary" : "text-text-primary"
            } ${isStreaming && !smoothedContent ? "typing-cursor" : ""}`}
        >
          {smoothedContent ? (
            (() => {
              const text = smoothedContent;
              const thinkMatches = [...text.matchAll(/<think>([\s\S]*?)(?:<\/think>|$)/gi)];
              const isThinkingActive = text.includes("<think>") && !text.includes("</think>");
              
              if (thinkMatches.length > 0) {
                const thinkText = thinkMatches.map(m => m[1].trim()).join("\n\n---\n\n");
                const restText = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim();
                
                // If there are multiple think blocks, the first one is the router (Assessing), second is reasoner (Interpreting)
                const isRouterThinking = thinkMatches.length === 1 && isThinkingActive;
                const isReasonerThinking = thinkMatches.length > 1 && isThinkingActive;
                
                return (
                  <>
                    <details className="mb-4 group">
                      <summary className="cursor-pointer text-xs font-semibold text-accent/70 hover:text-accent transition-colors flex items-center gap-2 select-none">
                        <span className="group-open:rotate-90 transition-transform">▶</span>
                        Thought Process
                        {isRouterThinking && <ThinkingStatus isRouter={true} />}
                        {isReasonerThinking && <ThinkingStatus isRouter={false} />}
                      </summary>
                      <div className="mt-2 text-xs text-text-muted border-l-2 border-accent/30 pl-3 py-1 whitespace-pre-wrap font-mono">
                        {thinkText}
                      </div>
                    </details>
                    {restText && (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                      >
                        {restText}
                      </ReactMarkdown>
                    )}
                  </>
                );
              }
              
              return (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw]}
                >
                  {text}
                </ReactMarkdown>
              );
            })()
          ) : (
            isStreaming ? "" : "..."
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
