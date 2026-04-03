import { Gamepad2, Search, ArrowLeft } from "lucide-react";

interface SkeletonProps {
  className?: string;
}

export const SkeletonCard = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-card rounded-2xl border border-border p-4 ${className}`}>
    <div className="h-40 bg-secondary rounded-xl mb-4"></div>
    <div className="h-5 bg-secondary rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-secondary rounded w-1/2"></div>
  </div>
);

export const SkeletonText = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    <div className="h-4 bg-secondary rounded w-full"></div>
    <div className="h-4 bg-secondary rounded w-5/6"></div>
    <div className="h-4 bg-secondary rounded w-4/6"></div>
  </div>
);

export const SkeletonHeader = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse flex items-center gap-4 ${className}`}>
    <div className="w-12 h-12 bg-secondary rounded-xl"></div>
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-secondary rounded w-1/3"></div>
      <div className="h-3 bg-secondary rounded w-1/4"></div>
    </div>
  </div>
);

export const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Gamepad2 className="h-6 w-6 text-primary animate-pulse" />
      </div>
    </div>
    <p className="mt-4 text-sm text-muted-foreground font-medium">Yükleniyor...</p>
  </div>
);

export const EmptyState = ({ 
  title = "Henüz içerik yok", 
  description = "Bu bölümde henüz bir şey yok.",
  icon: Icon = Search,
  action,
  actionLabel
}: { 
  title?: string; 
  description?: string; 
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  actionLabel?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
      <Icon className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {action && actionLabel && (
      <button 
        onClick={action}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {actionLabel}
      </button>
    )}
  </div>
);
