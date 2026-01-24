import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t py-4 px-4 text-center text-sm"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
        color: "var(--text-muted)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="flex items-center justify-center gap-1.5">
          This website is built and designed by{" "}
          <span className="font-medium" style={{ color: "var(--accent)" }}>
            ruex64
          </span>{" "}
          and belongs to him. All data is under his copyright.
          <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
        </p>
      </div>
    </footer>
  );
}