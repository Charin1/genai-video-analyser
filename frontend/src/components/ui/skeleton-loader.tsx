import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "line";
}

export function SkeletonLoader({ className, variant = "text" }: SkeletonLoaderProps) {
  const variants = {
    text: "h-4 w-full",
    card: "h-32 w-full",
    avatar: "h-10 w-10 rounded-full",
    line: "h-px w-full",
  };

  return (
    <div
      className={cn(
        "rounded-lg animate-shimmer",
        variants[variant],
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-1/3" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLoader className="h-16 w-full" />
      <SkeletonLoader className="h-4 w-2/3" />
    </div>
  );
}
