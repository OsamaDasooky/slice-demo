import { useStore } from "../store"
import type { Role, Route } from "../types"
import { cn } from "./primitives"

export type ModuleSection = {
  label: string
  description: string
  route: Route
}

const MAKER_SECTIONS: ModuleSection[] = [
  {
    label: "Offers",
    description: "Add, modify and manage merchant slice offers",
    route: { name: "offers" },
  },
  {
    label: "BINs",
    description: "Add, modify and manage card BINs",
    route: { name: "bins" },
  },
  {
    label: "Merchant Mapping",
    description: "Map merchant MIDs against offers and BIN groups",
    route: { name: "mapping" },
  },
  {
    label: "Requested Queue",
    description: "Track the offer, BIN, and merchant mapping changes you submitted",
    route: { name: "requested" },
  },
  {
    label: "Feed & Response Files",
    description: "Track generated batch files and download their response logs",
    route: { name: "feed" },
  },
]

const CHECKER_SECTIONS: ModuleSection[] = [
  {
    label: "Approval Queue",
    description:
      "Review and approve pending offer, BIN, and merchant mapping changes",
    route: { name: "requested" },
  },
]

export function moduleSections(role: Role): ModuleSection[] {
  if (role === "Slice Admin Maker") return MAKER_SECTIONS
  if (role === "Slice Admin Checker") return CHECKER_SECTIONS
  return []
}

/** Feed & Response Files is reachable from the hub only, never from the tabs. */
export function tabSections(role: Role): ModuleSection[] {
  return moduleSections(role).filter(
    (section) => section.route.name !== "feed",
  )
}

/** Sub-pages roll up to the tab that owns them. */
const TAB_OWNER: Partial<Record<Route["name"], Route["name"]>> = {
  "offer-details": "offers",
  "bin-details": "bins",
  review: "requested",
}

export function ModuleTabs() {
  const { role, route, navigate } = useStore()
  const sections = tabSections(role)
  if (sections.length === 0 || route.name === "hub") return null

  const activeName = TAB_OWNER[route.name] ?? route.name

  // Pages reached only from the hub (Feed & Response Files) have no tab to own
  // them, so the tab strip is hidden rather than shown with nothing selected.
  if (!sections.some((section) => section.route.name === activeName)) return null

  return (
    <div className="mx-auto mt-4 max-w-[1200px] px-5">
      <nav
        className="flex gap-1 overflow-x-auto border-b border-border"
        aria-label="Slice Configuration sections"
      >
        {sections.map((section) => {
          const active = section.route.name === activeName
          return (
            <button
              key={section.label}
              type="button"
              onClick={() => navigate(section.route)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "min-w-max border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-portal-ink",
              )}
            >
              {section.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
