import { ShieldAlert } from "lucide-react"
import { Card } from "../components/primitives"

export function Blocked() {
  return (
    <Card className="mx-auto max-w-xl">
      <div className="px-8 py-12 text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </span>
        <h1 className="text-xl font-semibold text-portal-ink">
          Slice Configuration is not available
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Your user does not hold any EPP Slice permissions, so this Settings
          module is blocked. Ask a portal administrator to grant the Slice Admin
          Maker or Slice Admin Checker role.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Required: VIEW_EPP_SLICE_CONFIG
        </p>
      </div>
    </Card>
  )
}
