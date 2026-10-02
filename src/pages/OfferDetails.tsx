import { useState } from "react"
import { ArrowLeft, Pencil } from "lucide-react"
import { useStore } from "../store"
import { OfferDetailView } from "../components/EntityViews"
import { Button, Card, EmptyState, StatusBadge } from "../components/primitives"
import { OfferPanel } from "../panels/OfferPanel"

export function OfferDetails({
  offerId,
  tenor,
}: {
  offerId: string
  tenor?: string
}) {
  const { role, offers, navigate, hasPendingFor } = useStore()
  const offer = offers.find((item) => item.offerId === offerId)
  const [editing, setEditing] = useState(false)
  const isMaker = role === "Slice Admin Maker"

  if (!offer) {
    return (
      <Card>
        <EmptyState
          title="Offer not found"
          hint="It may have been deleted after an approval."
        />
      </Card>
    )
  }

  const pending = hasPendingFor("Offer", offer.offerId)
  const tenure =
    offer.tenures.find((item) => item.tenor === tenor) ?? offer.tenures[0]

  return (
    <>
      <button
        type="button"
        onClick={() => navigate({ name: "offers" })}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to Offers
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Offer details
          </p>
          <h1 className="text-[2rem] font-light leading-tight tracking-wide text-portal-ink">
            {offer.offerId}
          </h1>
          <p className="text-sm text-muted-foreground">
            {offer.name}
            {tenure && ` · ${tenure.tenor} months`}
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
          A change request for this offer is awaiting Checker approval.
        </p>
      )}

      <OfferDetailView offer={offer} tenure={tenure} />

      {editing && (
        <OfferPanel
          open
          mode="modify"
          offer={offer}
          tenor={tenure?.tenor}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
