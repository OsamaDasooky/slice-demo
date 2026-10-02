import { useState } from "react"
import { Eye, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { useStore } from "../store"
import type { BinGroup } from "../types"
import {
  ActionMenu,
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  PageTitle,
  Row,
} from "../components/primitives"
import { PageHeading } from "../components/PageHeading"
import { BinPanel } from "../panels/BinPanel"
import { BulkUploadPanel } from "../panels/BulkUploadPanel"

export function BinsList() {
  const { role, bins, navigate, isBinLinked, hasPendingFor, submitRequest } =
    useStore()
  const isMaker = role === "Slice Admin Maker"

  const [panel, setPanel] = useState<{
    mode: "add" | "modify"
    bin?: BinGroup
  } | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BinGroup | null>(null)

  return (
    <>
      <PageHeading>
      <PageTitle
        title="BINs"
        count={bins.length}
        actions={
          isMaker ? (
            <>
              <Button variant="outline" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" />
                Upload BINs File
              </Button>
              <Button onClick={() => setPanel({ mode: "add" })}>
                <Plus className="size-4" />
                New
              </Button>
            </>
          ) : null
        }
      />
      </PageHeading>

      <DataTable
        headers={
          isMaker
            ? [
                "BIN Group Name",
                "Bank Name",
                "Bank Short Name",
                "Creation Date",
                "Actions",
              ]
            : ["BIN Group Name", "Bank Name", "Bank Short Name", "Creation Date"]
        }
        empty={
          bins.length === 0 ? (
            <EmptyState title="No approved BINs yet" />
          ) : undefined
        }
      >
        {bins.map((bin, index) => {
          const linked = isBinLinked(bin.groupName)
          const pending = hasPendingFor("Bin", bin.groupName)
          return (
            <Row key={bin.groupName} index={index}>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate({ name: "bin-details", groupName: bin.groupName })
                  }
                  className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {bin.groupName}
                </button>
              </td>
              <td className="px-4 py-3">{bin.bankName}</td>
              <td className="px-4 py-3">{bin.bankShortName}</td>
              <td className="px-4 py-3">{bin.createdAt}</td>
              {isMaker && (
                <td className="px-4 py-3">
                  <ActionMenu
                    items={[
                      {
                        label: "View details",
                        icon: <Eye className="size-4" />,
                        onSelect: () =>
                          navigate({
                            name: "bin-details",
                            groupName: bin.groupName,
                          }),
                      },
                      {
                        label: "Modify",
                        icon: <Pencil className="size-4" />,
                        disabled: pending,
                        disabledHint: pending
                          ? "A change request is already pending"
                          : undefined,
                        onSelect: () => setPanel({ mode: "modify", bin }),
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
                        onSelect: () => setDeleteTarget(bin),
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
          Read-only view — only a Slice Admin Maker can create or change BIN
          groups.
        </p>
      )}

      {panel && (
        <BinPanel
          open
          mode={panel.mode}
          bin={panel.bin}
          onClose={() => setPanel(null)}
        />
      )}

      <BulkUploadPanel
        open={uploadOpen}
        type="Bin"
        onClose={() => setUploadOpen(false)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete BIN"
        message="Are you sure you want to delete the BIN Group"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          submitRequest({
            type: "Bin",
            action: "Delete",
            entityName: `${deleteTarget.groupName} · ${deleteTarget.bankName}`,
            targetId: deleteTarget.groupName,
            payload: { bin: deleteTarget },
          })
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
