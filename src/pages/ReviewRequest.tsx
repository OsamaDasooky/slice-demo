import { useState } from "react"
import { ArrowLeft, Check, Download, FileSpreadsheet, X } from "lucide-react"
import { useStore } from "../store"
import { actionLabel, downloadTextFile } from "../lib/format"
import {
  BinDetailView,
  MappingDetailView,
  OfferDetailView,
} from "../components/EntityViews"
import {
  Button,
  Card,
  DetailGrid,
  EmptyState,
  Row,
  SectionTitle,
  StatusBadge,
  Textarea,
} from "../components/primitives"

export function ReviewRequest({ requestId }: { requestId: string }) {
  const { role, requests, decideRequest, navigate } = useStore()
  const request = requests.find((item) => item.id === requestId)
  const [comment, setComment] = useState("")
  const isChecker = role === "Slice Admin Checker"

  if (!request) {
    return (
      <Card>
        <EmptyState title="Request not found" />
      </Card>
    )
  }

  const decided = request.status !== "Pending"
  const payload = request.payload

  const decide = (decision: "Approved" | "Rejected") => {
    decideRequest(request.id, decision, comment)
    navigate({ name: "requested" })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate({ name: "requested" })}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to {isChecker ? "Approval Queue" : "Requested Queue"}
      </button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {request.type} · {actionLabel(request.action)}
          </p>
          <h1 className="text-[2rem] font-light leading-tight text-portal-ink">
            {request.entityName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={request.status} />
          {!decided && isChecker && (
            <div className="flex gap-2">
              <Button variant="success" onClick={() => decide("Approved")}>
                <Check className="size-4" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => decide("Rejected")}>
                <X className="size-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {decided ? (
        <p className="mb-8 border-l-4 border-primary bg-primary/10 px-3 py-2 text-sm text-portal-ink">
          This request was already {request.status.toLowerCase()} and is no
          longer in the approval queue.
          {request.checkerComment && (
            <span className="mt-1 block text-muted-foreground">
              Checker comment: {request.checkerComment}
            </span>
          )}
        </p>
      ) : !isChecker ? (
        <p className="mb-8 border-l-4 border-status-warning bg-status-warning/10 px-3 py-2 text-sm text-portal-ink">
          Waiting for a Slice Admin Checker to approve or reject this request.
        </p>
      ) : null}

      <div className="mb-8">
        <DetailGrid
          items={[
            { label: "Submitted By", value: request.submittedBy },
            { label: "Submitted On", value: request.submittedOn },
            { label: "Action", value: actionLabel(request.action) },
          ]}
        />
      </div>


      {request.changes && request.changes.length > 0 && (
        <section className="mb-8 border-l-4 border-primary bg-muted/50 px-5 py-5">
          <SectionTitle
            title="Modified fields"
            hint="Only the fields changed by this request"
          />
          <div className="overflow-x-auto bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Field</th>
                  <th className="px-4 py-3">Old Value</th>
                  <th className="px-4 py-3">New Value</th>
                </tr>
              </thead>
              <tbody>
                {request.changes.map((change, index) => (
                  <Row key={change.field} index={index}>
                    <td className="px-4 py-3 font-semibold text-portal-ink">
                      {change.field}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground line-through">
                      {change.oldValue || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-status-success">
                      {change.newValue || "—"}
                    </td>
                  </Row>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {request.file ? (
        <div className="mb-8">
          <SectionTitle
            title="Uploaded file"
            hint="Approve or reject applies to every record in this file"
          />
          <div className="flex flex-wrap items-center gap-4 bg-muted/60 px-4 py-4">
            <FileSpreadsheet className="size-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-portal-ink">
                {request.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.file.sizeLabel} · {request.file.rowCount} records
              </p>
            </div>
            {isChecker && (
              <Button
                variant="outline"
                onClick={() =>
                  downloadTextFile(
                    request.file?.name ?? "bulk.csv",
                    request.file?.csv ?? "",
                  )
                }
              >
                <Download className="size-4" />
                Download
              </Button>
            )}
          </div>
        </div>
      ) : payload?.offer ? (
        <div className="mb-8 border-t border-border pt-6">
          <OfferDetailView offer={payload.offer} />
        </div>
      ) : payload?.bin ? (
        <div className="mb-8 border-t border-border pt-6">
          <BinDetailView bin={payload.bin} />
        </div>
      ) : payload?.mapping ? (
        <div className="mb-8 border-t border-border pt-6">
          <MappingDetailView mapping={payload.mapping} />
        </div>
      ) : request.summary && request.summary.length > 0 ? (
        <div className="mb-8">
          <SectionTitle title="Submitted values" />
          <DetailGrid
            items={request.summary.map((item) => ({
              label: item.field,
              value: item.value || "—",
            }))}
          />
        </div>
      ) : null}

      <div className="mb-8 border-t border-border pt-6">
        <SectionTitle title="Audit trail" />
        <ol className="space-y-3">
          {request.audit.map((entry, index) => (
            <li key={`${entry.label}-${index}`} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-semibold text-portal-ink">
                  {entry.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.actor} · {entry.at}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {!decided && isChecker && (
        <div className="border-t border-border pt-6 sm:max-w-xl">
          <SectionTitle title="Checker comment" hint="Optional" />
          <Textarea
            value={comment}
            rows={3}
            placeholder="Add context for the Maker…"
            onChange={setComment}
          />
        </div>
      )}
    </>
  )
}
