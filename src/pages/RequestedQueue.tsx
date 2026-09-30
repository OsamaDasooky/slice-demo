import { useState } from "react"
import { Ban, ClipboardCheck, Eye } from "lucide-react"
import { useStore } from "../store"
import { actionLabel, parseCreationDate } from "../lib/format"
import type { ChangeRequest, RequestType } from "../types"
import {
  ActionMenu,
  Button,
  ConfirmModal,
  DataTable,
  EmptyState,
  Field,
  PageTitle,
  Row,
  Select,
  StatusBadge,
  inputClass,
} from "../components/primitives"

const TYPE_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Offer", label: "Offer" },
  { value: "Bin", label: "Bin" },
  { value: "Mapping", label: "Mapping" },
]

const STATUS_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Cancelled", label: "Cancelled" },
]

export function RequestedQueue() {
  const { role, requests, pendingRequests, navigate, cancelRequest } = useStore()
  const isChecker = role === "Slice Admin Checker"

  // The Checker only ever works the pending queue; the Maker tracks everything.
  const scoped = isChecker ? pendingRequests : requests

  const [type, setType] = useState("All")
  const [status, setStatus] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [cancelTarget, setCancelTarget] = useState<ChangeRequest | null>(null)

  const rows = scoped.filter((request) => {
    const typeMatch = type === "All" || request.type === (type as RequestType)
    const statusMatch =
      isChecker || status === "All" || request.status === status

    const submitted = parseCreationDate(request.submittedOn)
    const afterFrom =
      !dateFrom || !submitted || submitted >= new Date(`${dateFrom}T00:00:00`)
    const beforeTo =
      !dateTo || !submitted || submitted <= new Date(`${dateTo}T00:00:00`)

    return typeMatch && statusMatch && afterFrom && beforeTo
  })

  const dateFilterActive = Boolean(dateFrom || dateTo)

  return (
    <>
      <PageTitle
        title="Requested Queue"
        count={scoped.length}
        description={
          isChecker
            ? "Pending Slice configuration changes submitted by Makers."
            : "Every change you submitted, with its current approval outcome."
        }
      />

      <div className="mb-5 grid gap-5 sm:max-w-3xl sm:grid-cols-3">
        <Field label="Type">
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
        </Field>
        {!isChecker && (
          <Field label="Status">
            <Select
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </Field>
        )}
        <div className={isChecker ? "" : "sm:col-span-1"}>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">
            Submitted Date
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Submitted from"
              className={inputClass}
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <span className="text-sm text-muted-foreground">–</span>
            <input
              type="date"
              aria-label="Submitted to"
              className={inputClass}
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          {dateFilterActive && (
            <button
              type="button"
              className="mt-1 text-xs font-semibold text-primary hover:underline"
              onClick={() => {
                setDateFrom("")
                setDateTo("")
              }}
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      <DataTable
        headers={[
          "Type",
          "Action",
          "Entity",
          "Submitted By",
          "Submitted On",
          "Status",
          isChecker ? "Review" : "Actions",
        ]}
        empty={
          rows.length === 0 ? (
            <EmptyState
              title={
                isChecker
                  ? "Nothing waiting for approval"
                  : "No requests match this filter"
              }
              hint={
                isChecker
                  ? "Approved, rejected and cancelled requests leave the queue automatically."
                  : undefined
              }
            />
          ) : undefined
        }
      >
        {rows.map((request, index) => (
          <Row key={request.id} index={index}>
            <td className="px-4 py-3 font-semibold uppercase text-portal-ink">
              {request.type}
            </td>
            <td className="px-4 py-3">{actionLabel(request.action)}</td>
            <td className="px-4 py-3">{request.entityName}</td>
            <td className="px-4 py-3">{request.submittedBy}</td>
            <td className="px-4 py-3">{request.submittedOn}</td>
            <td className="px-4 py-3">
              <StatusBadge status={request.status} />
            </td>
            <td className="px-4 py-3">
              {isChecker ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate({ name: "review", requestId: request.id })
                  }
                >
                  <ClipboardCheck className="size-3.5" />
                  Review
                </Button>
              ) : (
                <ActionMenu
                  items={[
                    {
                      label: "View details",
                      icon: <Eye className="size-4" />,
                      onSelect: () =>
                        navigate({ name: "review", requestId: request.id }),
                    },
                    ...(request.status === "Pending"
                      ? [
                          {
                            label: "Cancel",
                            icon: <Ban className="size-4" />,
                            tone: "danger" as const,
                            onSelect: () => setCancelTarget(request),
                          },
                        ]
                      : []),
                  ]}
                />
              )}
            </td>
          </Row>
        ))}
      </DataTable>

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel request"
        message="Are you sure you want to cancel the request"
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) cancelRequest(cancelTarget.id)
          setCancelTarget(null)
        }}
      />
    </>
  )
}
