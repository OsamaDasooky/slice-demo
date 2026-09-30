import { CheckCircle2, Info, X, XCircle } from "lucide-react"
import { useStore } from "../store"
import { cn } from "./primitives"

export function Toaster() {
  const { toasts, dismissToast } = useStore()
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "flex items-start gap-3 rounded-[3px] border-l-4 bg-card px-4 py-3 shadow-popover",
            toast.tone === "success" && "border-l-status-success",
            toast.tone === "error" && "border-l-destructive",
            toast.tone === "info" && "border-l-primary",
          )}
        >
          {toast.tone === "success" && (
            <CheckCircle2 className="mt-0.5 size-4 text-status-success" />
          )}
          {toast.tone === "error" && (
            <XCircle className="mt-0.5 size-4 text-destructive" />
          )}
          {toast.tone === "info" && (
            <Info className="mt-0.5 size-4 text-primary" />
          )}
          <p className="flex-1 text-sm text-portal-ink">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="text-muted-foreground transition-colors hover:text-portal-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
