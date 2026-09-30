import { useState } from "react"
import { ArrowLeft, Pencil } from "lucide-react"
import { useStore } from "../store"
import { BinDetailView } from "../components/EntityViews"
import { Button, Card, EmptyState, StatusBadge } from "../components/primitives"
import { BinPanel } from "../panels/BinPanel"

export function BinDetails({ groupName }: { groupName: string }) {
  const { role, bins, navigate, hasPendingFor } = useStore()
  const bin = bins.find((item) => item.groupName === groupName)
  const [editing, setEditing] = useState(false)
  const isMaker = role === "Slice Admin Maker"

  if (!bin) {
    return (
      <Card>
        <EmptyState
          title="BIN not found"
          hint="It may have been deleted after an approval."
        />
      </Card>
    )
  }

  const pending = hasPendingFor("Bin", bin.groupName)

  return (
    <>
      <button
        type="button"
        onClick={() => navigate({ name: "bins" })}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to BINs
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            BIN group details
          </p>
          <h1 className="text-[2rem] font-light leading-tight tracking-wide text-portal-ink">
            {bin.groupName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bin.bankName} ({bin.bankShortName})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status="Approved" />
          {isMaker && (
            <Button
              onClick={() => setEditing(true)}
              disabled={pending}
              title={pending ? "A change request is already pending" : undefined}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {pending && (
        <p className="mb-6 border-l-4 border-status-warning bg-status-warning/10 px-3 py-2 text-sm text-portal-ink">
          A change request for this BIN is awaiting Checker approval.
        </p>
      )}

      <BinDetailView bin={bin} />

      {editing && (
        <BinPanel open mode="modify" bin={bin} onClose={() => setEditing(false)} />
      )}
    </>
  )
}
