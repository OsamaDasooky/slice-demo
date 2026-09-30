import { useMemo, useState } from "react"
import { Plus, XCircle } from "lucide-react"
import { useStore } from "../store"
import { isPastDate, parseActionDate, sliceFlagLabel } from "../lib/format"
import type { FieldChange, Offer, Tenure } from "../types"
import {
  Button,
  DateInput,
  Field,
  Input,
  SectionTitle,
  Select,
  SidePanel,
  Textarea,
} from "../components/primitives"

const EMPTY_TENURE: Tenure = {
  tenor: "",
  minAmount: "",
  maxAmount: "",
  feeType: "P",
  commissionType: "P",
  minCommission: "",
  maxCommission: "",
}

function blankOffer(): Offer {
  return {
    offerId: "",
    name: "",
    description: "",
    tenures: [{ ...EMPTY_TENURE }],
    actionDate: "",
    actionType: "Add",
    channel: "POS",
    acquirer: "NI",
    sliceFlag: "2",
    subvention: "",
    expiryDate: "",
    merchantFeeTyp: "P",
    merchantFee: "",
    bankRevPer: "",
    merchantCommissionType: "P",
    merchantCommission: "",
    createdAt: "",
  }
}

function diffOffers(before: Offer, after: Offer): FieldChange[] {
  const changes: FieldChange[] = []
  const compare = (field: string, oldValue: string, newValue: string) => {
    if (oldValue !== newValue) changes.push({ field, oldValue, newValue })
  }

  compare("Offer Name", before.name, after.name)
  compare("Description", before.description, after.description)
  compare("Action Type", before.actionType, after.actionType)
  compare("Channel", before.channel, after.channel)
  compare("Acquirer", before.acquirer, after.acquirer)
  compare(
    "Tenure list",
    before.tenures.map((item) => item.tenor).join(", "),
    after.tenures.map((item) => item.tenor).join(", "),
  )
  compare("Subvention (%)", before.subvention, after.subvention)
  compare("Expiry Date", before.expiryDate, after.expiryDate)
  compare("Action Date", before.actionDate, after.actionDate)
  compare("Merchant Fee", before.merchantFee, after.merchantFee)
  compare("Bank Revenue (%)", before.bankRevPer, after.bankRevPer)
  compare(
    "Merchant Commission Type",
    before.merchantCommissionType,
    after.merchantCommissionType,
  )
  compare(
    "Merchant Commission",
    before.merchantCommission,
    after.merchantCommission,
  )
  compare(
    "Slice Flag",
    sliceFlagLabel(before.sliceFlag),
    sliceFlagLabel(after.sliceFlag),
  )

  before.tenures.forEach((item, index) => {
    const next = after.tenures[index]
    if (!next) {
      changes.push({
        field: `Tenure ${index + 1}`,
        oldValue: `${item.tenor} months`,
        newValue: "Removed",
      })
      return
    }
    compare(`Tenor ${index + 1} · Min Amount`, item.minAmount, next.minAmount)
    compare(`Tenor ${index + 1} · Max Amount`, item.maxAmount, next.maxAmount)
    compare(`Tenor ${index + 1} · Fee Type`, item.feeType, next.feeType)
    compare(
      `Tenor ${index + 1} · Min Commission`,
      item.minCommission,
      next.minCommission,
    )
    compare(
      `Tenor ${index + 1} · Max Commission`,
      item.maxCommission,
      next.maxCommission,
    )
  })

  after.tenures.slice(before.tenures.length).forEach((item, index) => {
    changes.push({
      field: `Tenure ${before.tenures.length + index + 1}`,
      oldValue: "—",
      newValue: `${item.tenor} months`,
    })
  })

  return changes
}

export function OfferPanel({
  open,
  mode,
  offer,
  onClose,
}: {
  open: boolean
  mode: "add" | "modify"
  offer?: Offer
  onClose: () => void
}) {
  const { offers, submitRequest, pushToast } = useStore()
  const initial = useMemo(
    () => (mode === "modify" && offer ? structuredClone(offer) : blankOffer()),
    [mode, offer],
  )
  const [draft, setDraft] = useState<Offer>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof Offer>(key: K, value: Offer[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const updateTenure = <K extends keyof Tenure>(
    index: number,
    key: K,
    value: Tenure[K],
  ) => {
    setDraft((current) => ({
      ...current,
      tenures: current.tenures.map((item, position) =>
        position === index ? { ...item, [key]: value } : item,
      ),
    }))
  }

  const validate = () => {
    const next: Record<string, string> = {}

    if (!/^[A-Za-z0-9]{1,8}$/.test(draft.offerId.trim())) {
      next.offerId = "Alphanumeric, maximum 8 characters"
    } else if (
      mode === "add" &&
      offers.some(
        (item) =>
          item.offerId.toUpperCase() === draft.offerId.trim().toUpperCase(),
      )
    ) {
      next.offerId = "An offer with this ID already exists"
    }

    if (!draft.name.trim()) next.name = "Offer name is required"

    draft.tenures.forEach((item, index) => {
      if (!/^\d{1,2}$/.test(item.tenor.trim())) {
        next[`tenor-${index}`] = "Numeric, maximum 2 digits"
      }
      if (
        item.minAmount &&
        item.maxAmount &&
        Number(item.minAmount) > Number(item.maxAmount)
      ) {
        next[`max-${index}`] = "Max amount must be at least the min amount"
      }
      if (item.commissionType === "P") {
        if (!item.minCommission) {
          next[`minComm-${index}`] = "Required when commission type is Percentage"
        }
        if (!item.maxCommission) {
          next[`maxComm-${index}`] = "Required when commission type is Percentage"
        }
      }
    })

    if (!parseActionDate(draft.actionDate)) {
      next.actionDate = "Action date is required"
    } else if (isPastDate(draft.actionDate)) {
      next.actionDate = "Action date cannot be in the past"
    }

    if (draft.expiryDate && isPastDate(draft.expiryDate)) {
      next.expiryDate = "Expiry date cannot be in the past"
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      pushToast("Fix the highlighted fields before submitting", "error")
      return
    }

    const normalised: Offer = {
      ...draft,
      offerId: draft.offerId.trim().toUpperCase(),
      name: draft.name.trim(),
      subvention: draft.subvention || "0.00",
      createdAt: draft.createdAt || "Pending approval",
    }

    if (mode === "modify" && offer) {
      submitRequest({
        type: "Offer",
        action: "Modify",
        entityName: `${normalised.offerId} · ${normalised.name}`,
        targetId: offer.offerId,
        changes: diffOffers(offer, normalised),
        payload: { offer: normalised },
      })
    } else {
      submitRequest({
        type: "Offer",
        action: "Add",
        entityName: `${normalised.offerId} · ${normalised.name}`,
        targetId: normalised.offerId,
        payload: { offer: normalised },
      })
    }
    onClose()
  }

  return (
    <SidePanel
      open={open}
      title={mode === "modify" ? `Modify Offer: ${offer?.offerId}` : "Add New Offer"}
      submitLabel={mode === "modify" ? "Submit changes" : "Add offer"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Offer ID" required error={errors.offerId}>
          <Input
            value={draft.offerId}
            invalid={Boolean(errors.offerId)}
            placeholder="e.g. FAB0004"
            onChange={(value) => update("offerId", value)}
          />
        </Field>
        <Field label="Offer Name" required error={errors.name}>
          <Input
            value={draft.name}
            invalid={Boolean(errors.name)}
            placeholder="e.g. Festive Slice 10%"
            onChange={(value) => update("name", value)}
          />
        </Field>
        <Field label="Action Type" required>
          <Select
            value={draft.actionType}
            onChange={(value) =>
              update("actionType", value as Offer["actionType"])
            }
            options={[
              { value: "Add", label: "Add" },
              { value: "Modify", label: "Modify" },
            ]}
          />
        </Field>
        <Field label="Channel" required>
          <Select
            value={draft.channel}
            onChange={(value) => update("channel", value as Offer["channel"])}
            options={[
              { value: "POS", label: "POS" },
              { value: "ECOM", label: "ECOM" },
            ]}
          />
        </Field>
        <Field label="Acquirer" required>
          <Select
            value={draft.acquirer}
            onChange={() => undefined}
            options={[{ value: "NI", label: "NI" }]}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Description">
          <Textarea
            value={draft.description}
            placeholder="Short description of this plan"
            onChange={(value) => update("description", value)}
          />
        </Field>
      </div>

      <div className="mt-7">
        <SectionTitle
          title="Tenure details"
          hint="Each tenure can have its own parameters"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  tenures: [...current.tenures, { ...EMPTY_TENURE }],
                }))
              }
            >
              <Plus className="size-3.5" />
              Add tenure
            </Button>
          }
        />

        <div className="space-y-4">
          {draft.tenures.map((item, index) => (
            <div key={index} className="bg-muted/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Tenure {index + 1}
                </p>
                {draft.tenures.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove tenure ${index + 1}`}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        tenures: current.tenures.filter(
                          (_, position) => position !== index,
                        ),
                      }))
                    }
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <XCircle className="size-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Tenor (months)"
                  required
                  error={errors[`tenor-${index}`]}
                >
                  <Input
                    value={item.tenor}
                    invalid={Boolean(errors[`tenor-${index}`])}
                    placeholder="e.g. 3"
                    onChange={(value) => updateTenure(index, "tenor", value)}
                  />
                </Field>
                <Field label="Fee Type">
                  <Select
                    value={item.feeType}
                    onChange={(value) =>
                      updateTenure(index, "feeType", value as Tenure["feeType"])
                    }
                    options={[
                      { value: "P", label: "P — Percentage" },
                      { value: "F", label: "F — Flat" },
                    ]}
                  />
                </Field>
                <Field label="Min Amount">
                  <Input
                    value={item.minAmount}
                    placeholder="e.g. 1000"
                    onChange={(value) => updateTenure(index, "minAmount", value)}
                  />
                </Field>
                <Field label="Max Amount" error={errors[`max-${index}`]}>
                  <Input
                    value={item.maxAmount}
                    invalid={Boolean(errors[`max-${index}`])}
                    placeholder="e.g. 99999999"
                    onChange={(value) => updateTenure(index, "maxAmount", value)}
                  />
                </Field>
                <Field label="Commission Type">
                  <Select
                    value={item.commissionType}
                    onChange={(value) =>
                      updateTenure(
                        index,
                        "commissionType",
                        value as Tenure["commissionType"],
                      )
                    }
                    options={[
                      { value: "P", label: "Percentage" },
                      { value: "F", label: "Flat" },
                    ]}
                  />
                </Field>
                <Field
                  label="Min Commission"
                  error={errors[`minComm-${index}`]}
                >
                  <Input
                    value={item.minCommission}
                    invalid={Boolean(errors[`minComm-${index}`])}
                    placeholder="e.g. 1"
                    onChange={(value) =>
                      updateTenure(index, "minCommission", value)
                    }
                  />
                </Field>
                <Field
                  label="Max Commission"
                  error={errors[`maxComm-${index}`]}
                >
                  <Input
                    value={item.maxCommission}
                    invalid={Boolean(errors[`maxComm-${index}`])}
                    placeholder="e.g. 5"
                    onChange={(value) =>
                      updateTenure(index, "maxCommission", value)
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Subvention (%)">
          <Input
            value={draft.subvention}
            placeholder="e.g. 0.00"
            onChange={(value) => update("subvention", value)}
          />
        </Field>
        <Field label="Expiry Date" error={errors.expiryDate}>
          <DateInput
            value={draft.expiryDate}
            invalid={Boolean(errors.expiryDate)}
            onChange={(value) => update("expiryDate", value)}
          />
        </Field>
        <Field label="Action Date" required error={errors.actionDate}>
          <DateInput
            value={draft.actionDate}
            invalid={Boolean(errors.actionDate)}
            onChange={(value) => update("actionDate", value)}
          />
        </Field>
        <Field label="Merchant Fee Type">
          <Select
            value={draft.merchantFeeTyp}
            onChange={() => undefined}
            options={[{ value: "P", label: "P — Percentage" }]}
          />
        </Field>
        <Field label="Merchant Fee">
          <Input
            value={draft.merchantFee}
            placeholder="e.g. 2.00"
            onChange={(value) => update("merchantFee", value)}
          />
        </Field>
        <Field label="Bank Revenue (%)">
          <Input
            value={draft.bankRevPer}
            placeholder="e.g. 50.00"
            onChange={(value) => update("bankRevPer", value)}
          />
        </Field>
        <Field label="Merchant Commission Type">
          <Select
            value={draft.merchantCommissionType}
            onChange={(value) =>
              update(
                "merchantCommissionType",
                value as Offer["merchantCommissionType"],
              )
            }
            options={[
              { value: "P", label: "Percentage" },
              { value: "F", label: "Flat" },
            ]}
          />
        </Field>
        <Field label="Merchant Commission">
          <Input
            value={draft.merchantCommission}
            placeholder="e.g. 2.5"
            onChange={(value) => update("merchantCommission", value)}
          />
        </Field>
        <Field label="Slice Flag">
          <Select
            value={draft.sliceFlag}
            onChange={(value) => update("sliceFlag", value as Offer["sliceFlag"])}
            options={[
              { value: "2", label: "Slice by Network" },
              { value: "3", label: "Slice by Merchant" },
            ]}
          />
        </Field>
      </div>
    </SidePanel>
  )
}
