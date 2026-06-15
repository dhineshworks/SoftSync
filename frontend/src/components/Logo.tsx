import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function Logo({
  className,
  iconClassName,
  showWordmark = false,
  wordmarkClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={cn("size-7 shrink-0", iconClassName)}
      >
        <rect width="32" height="32" rx="10" className="fill-primary" />
        <path
          d="M10 16c0-2.2 1.8-4 4-4h1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        />
        <path
          d="M22 16c0 2.2-1.8 4-4 4h-1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-primary-foreground"
        />
        <path
          d="M20 11l2 2-2 2M12 21l-2-2 2-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-primary-foreground"
        />
      </svg>
      {showWordmark && (
        <span className={cn("font-display font-extrabold leading-none tracking-normal text-foreground", wordmarkClassName)}>SoftSync</span>
      )}
    </span>
  );
}
