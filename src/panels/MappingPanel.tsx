import { useMemo, useState } from "react"
import { nextMappingId, useStore } from "../store"
import type { FieldChange, Mapping } from "../types"
import { Field, Input, Select, SidePanel } from "../components/primitives"

function diffMappings(before: Mapping, after: Mapping): FieldChange[] {
  const changes: FieldChange[] = []
  const compare = (field: string, oldValue: string, newValue: string) => {
    if (oldValue !== newValue) changes.push({ field, oldValue, newValue })
  }
  compare("Offer ID", before.offerId, after.offerId)
  compare("Merchant ID (MID)", before.merchantId, after.merchantId)
  compare("Group / BIN Share", before.groupName, after.groupName)
  compare("Action", before.action, after.action)
  return changes
}

export function MappingPanel({
  open,
  mode,
  mapping,
  onClose,
}: {
  open: boolean
  mode: "add" | "modify"
  mapping?: Mapping
  onClose: () => void
}) {
  const { offers, bins, mappings, submitRequest, pushToast } = useStore()

  const initial = useMemo<Mapping>(
    () =>
      mode === "modify" && mapping
        ? structuredClone(mapping)
        : {
            id: nextMappingId(),
            offerId: offers[0]?.offerId ?? "",
            merchantId: "",
            groupName: bins[0]?.groupName ?? "",
            actionDate: "",
            action: "Integrate",
            channel: "POS",
            acquirer: "NI",
            createdAt: "",
          },
    [mode, mapping, offers, bins],
  )

  const [draft, setDraft] = useState<Mapping>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof Mapping>(key: K, value: Mapping[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!draft.offerId) next.offerId = "Select an active offer"
    if (!draft.groupName) next.groupName = "Select an active BIN group"
    if (!/^\d{12}$/.test(draft.merchantId.trim())) {
      next.merchantId = "Merchant ID must be numeric, exactly 12 digits"
    } else if (
      mappings.some(
        (item) =>
          item.id !== draft.id &&
          item.merchantId === draft.merchantId.trim() &&
          item.offerId === draft.offerId,
      )
    ) {
      next.merchantId = "This MID is already mapped to the selected offer"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      pushToast("Fix the highlighted fields before submitting", "error")
      return
    }

    const normalised: Mapping = {
      ...draft,
      merchantId: draft.merchantId.trim(),
      createdAt: draft.createdAt || "Pending approval",
    }

    if (mode === "modify" && mapping) {
      submitRequest({
        type: "Mapping",
        action: "Modify",
        entityName: `${normalised.offerId} · ${normalised.merchantId}`,
        targetId: mapping.id,
        changes: diffMappings(mapping, normalised),
        payload: { mapping: normalised },
      })
    } else {
      submitRequest({
        type: "Mapping",
        action: "Add",
        entityName: `${normalised.offerId} · ${normalised.merchantId}`,
        targetId: normalised.id,
        payload: { mapping: normalised },
      })
    }
    onClose()
  }

  return (
    <SidePanel
      open={open}
      title={mode === "modify" ? "Modify Mapping" : "Map Merchant to Offer"}
      description={
        mode === "modify"
          ? undefined
          : "Associate a merchant with an offer and BIN group."
      }
      submitLabel={mode === "modify" ? "Submit changes" : "Map merchant"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-5">
        <Field label="Offer ID" required error={errors.offerId}>
          <Select
            value={draft.offerId}
            invalid={Boolean(errors.offerId)}
            onChange={(value) => update("offerId", value)}
            options={offers.map((offer) => ({
              value: offer.offerId,
              label: offer.offerId,
            }))}
          />
        </Field>

        <Field label="Merchant ID (MID)" required error={errors.merchantId}>
          <Input
            value={draft.merchantId}
            invalid={Boolean(errors.merchantId)}
            placeholder="e.g. 001111093027"
            onChange={(value) => update("merchantId", value)}
          />
        </Field>

        <Field label="Group / BIN Share" required error={errors.groupName}>
          <Select
            value={draft.groupName}
            invalid={Boolean(errors.groupName)}
            onChange={(value) => update("groupName", value)}
            options={bins.map((bin) => ({
              value: bin.groupName,
              label: bin.groupName,
            }))}
          />
        </Field>

        <Field label="Action" required>
          <Select
            value={draft.action}
            onChange={(value) => update("action", value as Mapping["action"])}
            options={[
              { value: "Integrate", label: "Integrate" },
              { value: "Delete", label: "Delete" },
            ]}
          />
        </Field>
      </div>
    </SidePanel>
  )
}
