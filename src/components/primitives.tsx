import clsx from "clsx"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { AlertTriangle, ChevronDown, MoreVertical, X } from "lucide-react"
import { fromDateInput, toDateInput } from "../lib/format"

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs)
}

export function Button({
  children,
  onClick,
  variant = "solid",
  size = "md",
  disabled,
  title,
  type = "button",
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "solid" | "outline" | "ghost" | "danger" | "success"
  size?: "sm" | "md"
  disabled?: boolean
  title?: string
  type?: "button" | "submit"
  className?: string
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[3px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        size === "md" ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
        variant === "solid" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" &&
          "border border-primary text-primary hover:bg-primary/10",
        variant === "ghost" && "text-muted-foreground hover:bg-muted",
        variant === "danger" &&
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        variant === "success" &&
          "bg-status-success text-primary-foreground hover:opacity-90",
        className,
      )}
    >
      {children}
    </button>
  )
}

const DOT_TONE: Record<string, string> = {
  APPROVED: "bg-status-success",
  ACTIVE: "bg-status-success",
  PENDING: "bg-status-warning",
  REJECTED: "bg-destructive",
  CANCELLED: "bg-muted-foreground",
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase()
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-portal-ink">
      <span
        className={cn("size-2 rounded-full", DOT_TONE[key] ?? "bg-muted-foreground")}
        aria-hidden
      />
      {key}
    </span>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground">
      {children}
    </span>
  )
}

export function PageTitle({
  title,
  count,
  description,
  actions,
}: {
  title: string
  count?: number
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[2rem] font-light leading-tight text-portal-ink">
          {title}
          {count !== undefined && (
            <sup className="ml-1.5 text-sm font-normal text-muted-foreground">
              {count}
            </sup>
          )}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({
  children,
  className,
  flat,
}: {
  children: ReactNode
  className?: string
  flat?: boolean
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[3px] bg-card",
        flat ? "" : "border border-border shadow-table",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DataTable({
  headers,
  children,
  empty,
  flat,
  equalColumns,
}: {
  headers: string[]
  children: ReactNode
  empty?: ReactNode
  flat?: boolean
  equalColumns?: boolean
}) {
  return (
    <Card flat={flat}>
      <div className="overflow-x-auto">
        <table
          className={cn(
            "min-w-full text-left text-sm",
            // table-fixed only distributes evenly when the table has a width.
            equalColumns && "w-full table-fixed",
          )}
        >
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={cn(
                    "px-4 py-3 font-semibold",
                    // The trailing action column shrinks to fit its control.
                    !equalColumns &&
                      index === headers.length - 1 &&
                      "w-px whitespace-nowrap",
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {empty}
    </Card>
  )
}

export function Row({
  children,
  index,
}: {
  children: ReactNode
  index: number
}) {
  return (
    <tr
      className={cn(
        "border-t border-border align-middle",
        index % 2 === 1 && "bg-table-row-alt",
      )}
    >
      {children}
    </tr>
  )
}

export function EmptyState({
  title,
  hint,
}: {
  title: string
  hint?: string
}) {
  return (
    <div className="border-t border-border px-4 py-12 text-center">
      <p className="text-sm font-semibold text-portal-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export type MenuItem = {
  label: string
  icon?: ReactNode
  onSelect: () => void
  disabled?: boolean
  disabledHint?: string
  tone?: "default" | "danger"
}

export function ActionMenu({
  items,
  trigger,
}: {
  items: MenuItem[]
  /** Renders a labelled primary button instead of the row kebab icon. */
  trigger?: { label: string; icon?: ReactNode }
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="relative flex justify-end" ref={ref}>
      {trigger ? (
        <Button
          onClick={() => setOpen((value) => !value)}
          className="pr-3"
        >
          {trigger.icon}
          {trigger.label}
          <ChevronDown className="size-4" />
        </Button>
      ) : (
        <button
          type="button"
          aria-label="Open actions"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded p-1.5 text-portal-ink transition-colors hover:bg-muted"
        >
          <MoreVertical className="size-4" />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-30 min-w-52 overflow-hidden rounded-[3px] bg-action-menu py-1 text-action-menu-foreground shadow-popover",
            trigger ? "top-11" : "top-8",
          )}
        >
          {items.map((item) => (
            <div key={item.label}>
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  item.disabled
                    ? "cursor-not-allowed opacity-45"
                    : "hover:bg-action-menu-hover",
                  item.tone === "danger" && !item.disabled && "text-red-300",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
              {item.disabled && item.disabledHint && (
                <p className="px-3 pb-2 text-[11px] leading-snug text-white/55">
                  {item.disabledHint}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SidePanel({
  open,
  title,
  description,
  submitLabel,
  onClose,
  onSubmit,
  submitDisabled,
  children,
}: {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  onClose: () => void
  onSubmit: () => void
  submitDisabled?: boolean
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-portal-ink/45"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-[560px] flex-col bg-card shadow-popover"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide text-portal-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded border border-border p-1 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        <footer className="border-t border-border px-6 py-4">
          <Button
            onClick={onSubmit}
            disabled={submitDisabled}
            className="w-full"
          >
            {submitLabel}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-sm font-semibold text-primary hover:underline"
          >
            Cancel
          </button>
        </footer>
      </aside>
    </div>
  )
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-portal-ink/45 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[3px] bg-card p-6 shadow-popover"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-status-warning/20 text-portal-ink">
            <AlertTriangle className="size-5" />
          </span>
          <h2 className="text-base font-semibold text-portal-ink">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

export function Field({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  )
}

export const inputClass =
  "h-10 w-full border-0 border-b border-input bg-transparent px-0 text-sm text-portal-ink outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"

export function Input({
  value,
  onChange,
  placeholder,
  invalid,
  readOnly,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  invalid?: boolean
  readOnly?: boolean
  disabled?: boolean
}) {
  return (
    <input
      className={cn(
        inputClass,
        invalid && "border-destructive",
        (readOnly || disabled) && "cursor-not-allowed text-muted-foreground",
      )}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly || disabled}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
}) {
  return (
    <textarea
      rows={rows}
      disabled={disabled}
      className={cn(
        "w-full resize-none rounded-[3px] border border-input bg-transparent px-3 py-2 text-sm text-portal-ink outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary",
        disabled && "cursor-not-allowed text-muted-foreground",
      )}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

/** Native date picker that reads and writes DD-MMM-YYYY. */
export function DateInput({
  value,
  onChange,
  invalid,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <input
      type="date"
      disabled={disabled}
      className={cn(
        inputClass,
        invalid && "border-destructive",
        disabled && "cursor-not-allowed text-muted-foreground",
      )}
      value={toDateInput(value)}
      onChange={(event) => onChange(fromDateInput(event.target.value))}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
  invalid,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <select
      disabled={disabled}
      className={cn(
        inputClass,
        invalid && "border-destructive",
        disabled && "cursor-not-allowed text-muted-foreground",
      )}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-portal-ink">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

export function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-medium text-portal-ink">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
