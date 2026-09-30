import { useState } from "react"
import { Link2Off, Pencil, Plus, Upload } from "lucide-react"
import { useStore } from "../store"
import type { Mapping } from "../types"
import {
  ActionMenu,
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  PageTitle,
  Row,
} from "../components/primitives"
import { MappingPanel } from "../panels/MappingPanel"
import { BulkUploadPanel } from "../panels/BulkUploadPanel"

export function MerchantMapping() {
  const { role, mappings, hasPendingFor, submitRequest } = useStore()
  const isMaker = role === "Slice Admin Maker"

  const [panel, setPanel] = useState<{
    mode: "add" | "modify"
    mapping?: Mapping
  } | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<Mapping | null>(null)

  return (
    <>
      <PageTitle
        title="Merchant Mapping"
        count={mappings.length}
        actions={
          isMaker ? (
            <>
              <Button variant="outline" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" />
                Upload Mapping File
              </Button>
              <Button onClick={() => setPanel({ mode: "add" })}>
                <Plus className="size-4" />
                Map
              </Button>
            </>
          ) : null
        }
      />

      <DataTable
        headers={
          isMaker
            ? [
                "Offer ID",
                "Merchant ID",
                "Group / BIN Share",
                "Creation Date",
                "Actions",
              ]
            : ["Offer ID", "Merchant ID", "Group / BIN Share", "Creation Date"]
        }
        empty={
          mappings.length === 0 ? (
            <EmptyState
              title="No merchant mappings yet"
              hint="Map a MID to an offer and BIN group to get started."
            />
          ) : undefined
        }
      >
        {mappings.map((mapping, index) => {
          const pending = hasPendingFor("Mapping", mapping.id)
          return (
            <Row key={mapping.id} index={index}>
              <td className="px-4 py-3 font-semibold text-primary">
                {mapping.offerId}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {mapping.merchantId}
              </td>
              <td className="px-4 py-3">{mapping.groupName}</td>
              <td className="px-4 py-3">{mapping.createdAt}</td>
              {isMaker && (
                <td className="px-4 py-3">
                  <ActionMenu
                    items={[
                      {
                        label: "Modify",
                        icon: <Pencil className="size-4" />,
                        disabled: pending,
                        disabledHint: pending
                          ? "A change request is already pending"
                          : undefined,
                        onSelect: () => setPanel({ mode: "modify", mapping }),
                      },
                      {
                        label: "Unlink",
                        icon: <Link2Off className="size-4" />,
                        tone: "danger",
                        disabled: pending,
                        disabledHint: pending
                          ? "A change request is already pending"
                          : undefined,
                        onSelect: () => setUnlinkTarget(mapping),
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
          Read-only view — only a Slice Admin Maker can map or unlink merchants.
        </p>
      )}

      {panel && (
        <MappingPanel
          open
          mode={panel.mode}
          mapping={panel.mapping}
          onClose={() => setPanel(null)}
        />
      )}

      <BulkUploadPanel
        open={uploadOpen}
        type="Mapping"
        onClose={() => setUploadOpen(false)}
      />

      <ConfirmModal
        open={Boolean(unlinkTarget)}
        title="Unlink plan"
        message="Are you sure you want to unlink the plan"
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (!unlinkTarget) return
          submitRequest({
            type: "Mapping",
            action: "Unlink",
            entityName: `${unlinkTarget.offerId} · ${unlinkTarget.merchantId}`,
            targetId: unlinkTarget.id,
            payload: { mapping: unlinkTarget },
          })
          setUnlinkTarget(null)
        }}
      />
    </>
  )
}
