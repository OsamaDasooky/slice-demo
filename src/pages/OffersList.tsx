import { useState } from "react"
import { Eye, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { useStore } from "../store"
import type { Offer } from "../types"
import {
  ActionMenu,
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  PageTitle,
  Row,
} from "../components/primitives"
import { OfferPanel } from "../panels/OfferPanel"
import { BulkUploadPanel } from "../panels/BulkUploadPanel"

export function OffersList() {
  const {
    role,
    offers,
    navigate,
    isOfferLinked,
    hasPendingFor,
    submitRequest,
  } = useStore()
  const isMaker = role === "Slice Admin Maker"

  const [panel, setPanel] = useState<{ mode: "add" | "modify"; offer?: Offer } | null>(
    null,
  )
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null)

  return (
    <>
      <PageTitle
        title="Offers"
        count={offers.length}
        actions={
          isMaker ? (
            <>
              <Button variant="outline" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" />
                Upload Offers File
              </Button>
              <Button onClick={() => setPanel({ mode: "add" })}>
                <Plus className="size-4" />
                New
              </Button>
            </>
          ) : null
        }
      />

      <DataTable
        headers={
          isMaker
            ? ["Offer ID", "Tenure", "Creation Date", "Actions"]
            : ["Offer ID", "Tenure", "Creation Date"]
        }
        empty={
          offers.length === 0 ? (
            <EmptyState
              title="No approved offers yet"
              hint="Create an offer and ask the Checker to approve it."
            />
          ) : undefined
        }
      >
        {offers.map((offer, index) => {
          const linked = isOfferLinked(offer.offerId)
          const pending = hasPendingFor("Offer", offer.offerId)
          return (
            <Row key={offer.offerId} index={index}>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate({ name: "offer-details", offerId: offer.offerId })
                  }
                  className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {offer.offerId}
                </button>
              </td>
              <td className="px-4 py-3">
                {offer.tenures.map((item) => item.tenor).join(", ")} months
              </td>
              <td className="px-4 py-3">{offer.createdAt}</td>
              {isMaker && (
                <td className="px-4 py-3">
                  <ActionMenu
                    items={[
                      {
                        label: "View details",
                        icon: <Eye className="size-4" />,
                        onSelect: () =>
                          navigate({
                            name: "offer-details",
                            offerId: offer.offerId,
                          }),
                      },
                      {
                        label: "Modify",
                        icon: <Pencil className="size-4" />,
                        disabled: pending,
                        disabledHint: pending
                          ? "A change request is already pending"
                          : undefined,
                        onSelect: () => setPanel({ mode: "modify", offer }),
                      },
                      {
                        label: "Delete",
                        icon: <Trash2 className="size-4" />,
                        tone: "danger",
                        disabled: linked || pending,
                        disabledHint: linked
                          ? "Cannot delete while linked"
                          : pending
                            ? "A change request is already pending"
                            : undefined,
                        onSelect: () => setDeleteTarget(offer),
                      },
                    ]}
                  />
                </td>
              )}
            </Row>
          )
        })}
      </DataTable>

      {!isMaker && (
        <p className="mt-3 text-xs text-muted-foreground">
          Read-only view — only a Slice Admin Maker can create or change offers.
        </p>
      )}

      {panel && (
        <OfferPanel
          open
          mode={panel.mode}
          offer={panel.offer}
          onClose={() => setPanel(null)}
        />
      )}

      <BulkUploadPanel
        open={uploadOpen}
        type="Offer"
        onClose={() => setUploadOpen(false)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete offer"
        message="Are you sure you want to delete the Offer"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          submitRequest({
            type: "Offer",
            action: "Delete",
            entityName: `${deleteTarget.offerId} · ${deleteTarget.name}`,
            targetId: deleteTarget.offerId,
            payload: { offer: deleteTarget },
          })
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
