import type { BinGroup, Mapping, Offer, Tenure } from "../types"

type Row = Record<string, string>

export function parseCsv(csv: string): Row[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((header) => header.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(",")
    const row: Row = {}
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim()
    })
    return row
  })
}

function tenureFrom(row: Row): Tenure {
  return {
    tenor: row.tenor || "",
    minAmount: row.min_amount || "",
    maxAmount: row.max_amount || "",
    feeType: row.fee_type === "F" ? "F" : "P",
    commissionType: "P",
    minCommission: row.min_commission || "1",
    maxCommission: row.max_commission || "5",
  }
}

export function parseOffersCsv(csv: string, createdAt: string): Offer[] {
  const grouped = new Map<string, Offer>()

  for (const row of parseCsv(csv)) {
    const offerId = (row.offer_id || "").toUpperCase()
    if (!offerId) continue

    const existing = grouped.get(offerId)
    if (existing) {
      existing.tenures.push(tenureFrom(row))
      continue
    }

    grouped.set(offerId, {
      offerId,
      name: row.offer_name || `Bulk Offer ${offerId}`,
      description: row.description || "",
      tenures: [tenureFrom(row)],
      actionDate: row.action_date || "",
      actionType: "Add",
      channel: row.channel === "ECOM" ? "ECOM" : "POS",
      acquirer: "NI",
      sliceFlag: row.slice_flag === "3" ? "3" : "2",
      subvention: row.subvention || "0.00",
      expiryDate: row.expiry_date || "",
      merchantFeeTyp: "P",
      merchantFee: row.merchant_fee || "",
      bankRevPer: row.bank_rev_per || "",
      merchantCommissionType: "P",
      merchantCommission: row.merchant_commission || row.merchant_fee || "",
      createdAt,
    })
  }

  return [...grouped.values()]
}

export function parseBinsCsv(csv: string, createdAt: string): BinGroup[] {
  return parseCsv(csv)
    .filter((row) => row.bin_group)
    .map((row) => ({
      action: row.action === "Modify" ? ("Modify" as const) : ("Add" as const),
      groupName: row.bin_group.toUpperCase(),
      bankName: row.bank_name || "",
      bankShortName: (row.bank_short_name || "").toUpperCase(),
      bin: (row.bin || row.bins || "").trim(),
      revenueSharingFrequency: row.rev_share_freq === "D" ? "D" : "M",
      iban: row.iban || "",
      agentCode: row.agent_code || "",
      paymentMode:
        row.payment_mode === "EQ" ? "EQ" : row.payment_mode === "OB" ? "OB" : "FN",
      currency: "AED",
      addressLine1: row.address_line_1 || "",
      addressLine2: row.address_line_2 || "",
      addressLine3: row.address_line_3 || "",
      city: row.city || "",
      panLength: row.pan_length || "16",
      prefixLength: row.prefix_length || "6",
      flg: row.flg || "Y",
      shrgFlg: (row.shrg_flg || row.bin_group).toUpperCase(),
      swiftCode: row.swift_code || "",
      routingNumber: row.routing_number || "",
      skipPsn: row.skip_psn || "N",
      createdAt,
    }))
}

export function parseMappingsCsv(csv: string, createdAt: string): Mapping[] {
  return parseCsv(csv)
    .filter((row) => row.offer_id && row.merchant_id)
    .map((row, index) => ({
      id: `MAP-BULK-${Date.now().toString(36)}-${index}`,
      offerId: row.offer_id.toUpperCase(),
      merchantId: row.merchant_id,
      groupName: (row.group_bin_share || "").toUpperCase(),
      actionDate: row.action_date || "",
      action: row.action === "Delete" ? "Delete" : "Integrate",
      channel: row.channel === "ECOM" ? "ECOM" : "POS",
      acquirer: "NI",
      createdAt,
    }))
}
