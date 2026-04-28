export function Input({ label, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[0.9rem] text-[var(--text-secondary)] uppercase tracking-[1px]">
          {label}
        </label>
      )}
      <input
        className="p-[0.8rem] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text-primary)] font-[var(--font-inter)] focus:outline-none focus:border-[var(--gold-accent)]"
        {...props}
      />
    </div>
  );
}
