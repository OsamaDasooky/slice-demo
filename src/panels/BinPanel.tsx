import { useMemo, useState } from "react"
import { useStore } from "../store"
import type { BinGroup, FieldChange } from "../types"
import { Field, Input, Select, SidePanel } from "../components/primitives"

function blankBin(): BinGroup {
  return {
    action: "Add",
    groupName: "",
    bankName: "",
    bankShortName: "",
    bin: "",
    revenueSharingFrequency: "M",
    iban: "",
    agentCode: "",
    paymentMode: "OB",
    currency: "AED",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    panLength: "",
    prefixLength: "",
    flg: "",
    shrgFlg: "",
    swiftCode: "",
    routingNumber: "",
    skipPsn: "",
    createdAt: "",
  }
}

function diffBins(before: BinGroup, after: BinGroup): FieldChange[] {
  const changes: FieldChange[] = []
  const compare = (field: string, oldValue: string, newValue: string) => {
    if (oldValue !== newValue) changes.push({ field, oldValue, newValue })
  }
  compare("Action", before.action, after.action)
  compare("Bank Name", before.bankName, after.bankName)
  compare("Bank Short Name", before.bankShortName, after.bankShortName)
  compare("BIN", before.bin, after.bin)
  compare(
    "Revenue Sharing Frequency",
    before.revenueSharingFrequency,
    after.revenueSharingFrequency,
  )
  compare("IBAN", before.iban, after.iban)
  compare("SWIFT Code", before.swiftCode, after.swiftCode)
  compare("Routing Number", before.routingNumber, after.routingNumber)
  compare("Agent Code", before.agentCode, after.agentCode)
  compare("Payment Mode", before.paymentMode, after.paymentMode)
  compare("Address Line 1", before.addressLine1, after.addressLine1)
  compare("Address Line 2", before.addressLine2, after.addressLine2)
  compare("Address Line 3", before.addressLine3, after.addressLine3)
  compare("City", before.city, after.city)
  compare("PAN Length", before.panLength, after.panLength)
  compare("Prefix Length", before.prefixLength, after.prefixLength)
  compare("FLG", before.flg, after.flg)
  compare("SHRG-FLG", before.shrgFlg, after.shrgFlg)
  compare("SkipPSN", before.skipPsn, after.skipPsn)
  return changes
}

export function BinPanel({
  open,
  mode,
  bin,
  onClose,
}: {
  open: boolean
  mode: "add" | "modify"
  bin?: BinGroup
  onClose: () => void
}) {
  const { bins, submitRequest, pushToast, findBinOwner } = useStore()
  const initial = useMemo(
    () => (mode === "modify" && bin ? structuredClone(bin) : blankBin()),
    [mode, bin],
  )
  const [draft, setDraft] = useState<BinGroup>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof BinGroup>(key: K, value: BinGroup[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const validate = () => {
    const next: Record<string, string> = {}

    if (!draft.bankName.trim() || draft.bankName.length > 40) {
      next.bankName = "Required, maximum 40 characters"
    }
    if (!/^[A-Za-z]{3,4}$/.test(draft.bankShortName.trim())) {
      next.bankShortName = "3 or 4 alphabetic characters, e.g. FAB"
    }

    if (!/^\d{6,9}$/.test(draft.bin.trim())) {
      next.bin = "BIN must be numeric, 6–9 digits"
    } else if (
      findBinOwner(draft.bin, mode === "modify" ? bin?.groupName : undefined)
    ) {
      next.bin =
        "This BIN is already assigned to another group and cannot be added."
    }

    if (!/^[A-Za-z0-9]{2}$/.test(draft.groupName.trim())) {
      next.groupName = "2 characters, e.g. E1"
    } else if (
      mode === "add" &&
      bins.some(
        (item) =>
          item.groupName.toUpperCase() === draft.groupName.trim().toUpperCase(),
      )
    ) {
      next.groupName = "A BIN group with this name already exists"
    }

    if (!/^[A-Za-z0-9]{23}$/.test(draft.iban.trim())) {
      next.iban = "23 alphanumeric characters"
    }
    if (!/^[A-Za-z0-9]{3,4}$/.test(draft.agentCode.trim())) {
      next.agentCode = "3–4 alphanumeric characters"
    }
    if (!draft.addressLine1.trim()) next.addressLine1 = "Required"
    if (!draft.city.trim()) next.city = "Required"

    const panLength = Number(draft.panLength)
    if (!Number.isInteger(panLength) || panLength < 16 || panLength > 19) {
      next.panLength = "Must be between 16 and 19"
    }
    if (!draft.prefixLength.trim()) next.prefixLength = "Required"
    if (!draft.flg.trim()) next.flg = "Required"
    if (!/^[A-Za-z0-9]{2}$/.test(draft.shrgFlg.trim())) {
      next.shrgFlg = "2 characters, e.g. E1"
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      pushToast("Fix the highlighted fields before submitting", "error")
      return
    }

    const normalised: BinGroup = {
      ...draft,
      action: mode === "modify" ? "Modify" : "Add",
      groupName: draft.groupName.trim().toUpperCase(),
      bankShortName: draft.bankShortName.trim().toUpperCase(),
      bin: draft.bin.trim(),
      shrgFlg: draft.shrgFlg.trim().toUpperCase(),
      createdAt: draft.createdAt || "Pending approval",
    }

    if (mode === "modify" && bin) {
      submitRequest({
        type: "Bin",
        action: "Modify",
        entityName: `${normalised.groupName} · ${normalised.bankName}`,
        targetId: bin.groupName,
        changes: diffBins(bin, normalised),
        payload: { bin: normalised },
      })
    } else {
      submitRequest({
        type: "Bin",
        action: "Add",
        entityName: `${normalised.groupName} · ${normalised.bankName}`,
        targetId: normalised.groupName,
        payload: { bin: normalised },
      })
    }
    onClose()
  }

  return (
    <SidePanel
      open={open}
      title={mode === "modify" ? `Modify BIN: ${bin?.groupName}` : "Add New BIN"}
      submitLabel={mode === "modify" ? "Submit changes" : "Add BIN"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Action" required>
          <Select
            value={mode === "modify" ? "Modify" : "Add"}
            disabled
            onChange={() => undefined}
            options={[
              { value: "Add", label: "Add" },
              { value: "Modify", label: "Modify" },
            ]}
          />
        </Field>
        <div className="hidden sm:block" />
        <Field label="Bank Name" required error={errors.bankName}>
          <Input
            value={draft.bankName}
            invalid={Boolean(errors.bankName)}
            placeholder="e.g. FAB/NBAD"
            onChange={(value) => update("bankName", value)}
          />
        </Field>
        <Field label="Bank Short Name" required error={errors.bankShortName}>
          <Input
            value={draft.bankShortName}
            invalid={Boolean(errors.bankShortName)}
            placeholder="e.g. FAB"
            onChange={(value) => update("bankShortName", value)}
          />
        </Field>

        <Field label="BIN" required error={errors.bin} hint="Numeric, 6–9 digits">
          <Input
            value={draft.bin}
            invalid={Boolean(errors.bin)}
            placeholder="e.g. 411111"
            onChange={(value) => update("bin", value)}
          />
        </Field>
        <Field label="BIN Group Name" required error={errors.groupName}>
          <Input
            value={draft.groupName}
            invalid={Boolean(errors.groupName)}
            placeholder="e.g. E1"
            onChange={(value) => update("groupName", value)}
          />
        </Field>

        <Field label="Revenue Sharing Frequency" required>
          <Select
            value={draft.revenueSharingFrequency}
            onChange={(value) =>
              update(
                "revenueSharingFrequency",
                value as BinGroup["revenueSharingFrequency"],
              )
            }
            options={[
              { value: "M", label: "Monthly" },
              { value: "D", label: "Daily" },
            ]}
          />
        </Field>
        <Field label="Currency" required>
          <Select
            value={draft.currency}
            onChange={() => undefined}
            options={[{ value: "AED", label: "AED" }]}
          />
        </Field>

        <Field label="IBAN" required error={errors.iban}>
          <Input
            value={draft.iban}
            invalid={Boolean(errors.iban)}
            placeholder="e.g. AE660351000701115810230"
            onChange={(value) => update("iban", value)}
          />
        </Field>
        <Field label="SWIFT Code">
          <Input
            value={draft.swiftCode}
            placeholder="e.g. FABAAEAD"
            onChange={(value) => update("swiftCode", value)}
          />
        </Field>

        <Field label="Routing Number">
          <Input
            value={draft.routingNumber}
            placeholder="Routing number"
            onChange={(value) => update("routingNumber", value)}
          />
        </Field>
        <Field label="Agent Code" required error={errors.agentCode}>
          <Input
            value={draft.agentCode}
            invalid={Boolean(errors.agentCode)}
            placeholder="e.g. 915"
            onChange={(value) => update("agentCode", value)}
          />
        </Field>

        <Field label="Payment Mode" required>
          <Select
            value={draft.paymentMode}
            onChange={(value) =>
              update("paymentMode", value as BinGroup["paymentMode"])
            }
            options={[
              { value: "FN", label: "FN" },
              { value: "EQ", label: "EQ" },
              { value: "OB", label: "OB" },
            ]}
          />
        </Field>
        <Field label="Address Line 1" required error={errors.addressLine1}>
          <Input
            value={draft.addressLine1}
            invalid={Boolean(errors.addressLine1)}
            placeholder="e.g. Abu Dhabi"
            onChange={(value) => update("addressLine1", value)}
          />
        </Field>

        <Field label="Address Line 2">
          <Input
            value={draft.addressLine2}
            placeholder="Optional"
            onChange={(value) => update("addressLine2", value)}
          />
        </Field>
        <Field label="Address Line 3">
          <Input
            value={draft.addressLine3}
            placeholder="Optional"
            onChange={(value) => update("addressLine3", value)}
          />
        </Field>

        <Field label="City" required error={errors.city}>
          <Input
            value={draft.city}
            invalid={Boolean(errors.city)}
            placeholder="e.g. Abu Dhabi"
            onChange={(value) => update("city", value)}
          />
        </Field>
        <Field label="PAN Length" required error={errors.panLength}>
          <Input
            value={draft.panLength}
            invalid={Boolean(errors.panLength)}
            placeholder="e.g. 16"
            onChange={(value) => update("panLength", value)}
          />
        </Field>

        <Field label="Prefix Length" required error={errors.prefixLength}>
          <Input
            value={draft.prefixLength}
            invalid={Boolean(errors.prefixLength)}
            placeholder="e.g. 6"
            onChange={(value) => update("prefixLength", value)}
          />
        </Field>
        <Field label="FLG" required error={errors.flg}>
          <Input
            value={draft.flg}
            invalid={Boolean(errors.flg)}
            placeholder="e.g. Y"
            onChange={(value) => update("flg", value)}
          />
        </Field>

        <Field label="SHRG-FLG" required error={errors.shrgFlg}>
          <Input
            value={draft.shrgFlg}
            invalid={Boolean(errors.shrgFlg)}
            placeholder="e.g. E1"
            onChange={(value) => update("shrgFlg", value)}
          />
        </Field>
        <Field label="SkipPSN">
          <Input
            value={draft.skipPsn}
            placeholder="e.g. 99"
            onChange={(value) => update("skipPsn", value)}
          />
        </Field>
      </div>
    </SidePanel>
  )
}
