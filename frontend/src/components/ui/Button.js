export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`mt-4 p-4 bg-[var(--gold-accent)] text-[var(--bg-color)] border-none uppercase tracking-[1px] font-semibold cursor-pointer transition-all duration-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
