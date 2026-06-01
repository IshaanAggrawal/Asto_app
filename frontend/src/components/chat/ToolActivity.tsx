interface ToolActivityProps {
  name: string;
  status: "pending" | "complete";
}

export default function ToolActivity({ name, status }: ToolActivityProps) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300"
      style={{
        background: status === "pending" ? "rgba(245, 166, 35, 0.1)" : "rgba(76, 175, 125, 0.1)",
        border: `1px solid ${status === "pending" ? "var(--border-strong)" : "rgba(76, 175, 125, 0.3)"}`,
      }}
    >
      {status === "pending" ? (
        <div
          className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-5"
            stroke="var(--success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span
        className="italic font-body"
        style={{
          color: status === "pending" ? "var(--accent)" : "var(--success)",
        }}
      >
        {name}
      </span>
    </div>
  );
}
