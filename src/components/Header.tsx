import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Settings, ShieldCheck, UserRound } from "lucide-react"
import { useStore } from "../store"
import { PERMISSIONS } from "../data/seed"
import type { Role, Route } from "../types"
import { cn } from "./primitives"

const ROLES: Role[] = [
  "Slice Admin Maker",
  "Slice Admin Checker",
  "Unauthorized",
]

const PORTAL_NAV = ["Summary", "Merchants", "Reports", "Imports", "Wallets"]

export function Header() {
  const { role, setRole, navigate } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onPointerDown)
    return () => window.removeEventListener("mousedown", onPointerDown)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-t-[3px] border-t-portal-ink bg-background shadow-header">
      <div className="mx-auto flex h-[78px] max-w-[1200px] items-center justify-between gap-4 px-5">
        <button
          type="button"
          className="flex items-center"
          aria-label="Network home"
          onClick={() => navigate({ name: "hub" })}
        >
          <span className="text-[31px] font-semibold leading-none text-brand">
            network
          </span>
          <span className="ml-1 text-[31px] font-semibold leading-none text-brand-mark">
            ›
          </span>
        </button>

        <nav
          className="hidden items-stretch self-stretch xl:flex"
          aria-label="Primary navigation"
        >
          {PORTAL_NAV.map((item) => (
            <button
              key={item}
              type="button"
              className="border-b-[3px] border-transparent px-5 text-sm font-semibold text-portal-ink transition-colors hover:border-primary hover:text-primary"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-portal-ink">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold">NI VAS</p>
            <p className="text-xs text-muted-foreground">
              Network International
            </p>
          </div>

          <div className="relative" ref={ref}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={`Current role: ${role}`}
              onClick={() => setOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-[3px] border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <UserRound className="size-4" />
              <span className="max-w-40 truncate">{role}</span>
              <ChevronDown className="size-4" />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 z-40 mt-1 w-72 rounded-[3px] border border-border bg-card py-1 shadow-popover"
              >
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Switch demo role
                </p>
                {ROLES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setRole(option)
                      setOpen(false)
                    }}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <ShieldCheck className="mt-0.5 size-4 text-primary" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-portal-ink">
                        {option}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {PERMISSIONS[option].length
                          ? `${PERMISSIONS[option].length} permissions`
                          : "No Slice permissions"}
                      </span>
                    </span>
                    {role === option && (
                      <Check className="mt-0.5 size-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Slice Configuration settings"
            onClick={() => navigate({ name: "hub" })}
            className="rounded p-2 transition-colors hover:bg-muted"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </div>

    </header>
  )
}

export function Breadcrumb({
  trail,
}: {
  trail: Array<{ label: string; route?: Route }>
}) {
  const { navigate } = useStore()
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-[1200px] px-5 pt-5 text-sm text-muted-foreground"
    >
      {trail.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`}>
          {index > 0 && <span className="mx-2">/</span>}
          {crumb.route ? (
            <button
              type="button"
              onClick={() => navigate(crumb.route as Route)}
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              {crumb.label}
            </button>
          ) : (
            <span
              className={cn(
                index === trail.length - 1 && "font-semibold text-portal-ink",
              )}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
