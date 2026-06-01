export default function LoadingOrbs() {
  return (
    <div className="flex items-center gap-2 py-4 px-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: "var(--accent)",
            animation: `pulseOrb 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulseOrb {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 12px rgba(245, 166, 35, 0.5);
          }
        }
      `}</style>
    </div>
  );
}
