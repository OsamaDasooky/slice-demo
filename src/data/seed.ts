import type {
  BinGroup,
  ChangeRequest,
  Mapping,
  Offer,
  PortalFile,
  Role,
  Tenure,
} from "../types"

export const MAKER_NAME = "R. Sharma (Maker)"
export const CHECKER_NAME = "A. Haddad (Checker)"

export const PERMISSIONS: Record<Role, string[]> = {
  "Slice Admin Maker": [
    "MANAGE_EPP_SLICE_CONFIG",
    "MANAGE_CHANGE_REQUESTS",
    "VIEW_EPP_SLICE",
    "VIEW_EPP_SLICE_CONFIG",
    "VIEW_CHANGE_REQUESTS",
  ],
  "Slice Admin Checker": [
    "REVIEW_CHANGE_REQUESTS",
    "VIEW_CHANGE_REQUESTS",
    "VIEW_EPP_SLICE",
    "VIEW_EPP_SLICE_CONFIG",
  ],
  Unauthorized: [],
}

function tenure(
  tenor: string,
  minAmount: string,
  maxAmount: string,
  overrides: Partial<Tenure> = {},
): Tenure {
  return {
    tenor,
    minAmount,
    maxAmount,
    feeType: "P",
    commissionType: "P",
    minCommission: "1",
    maxCommission: "5",
    ...overrides,
  }
}

export const seedOffers: Offer[] = [
  {
    offerId: "FAB0001",
    name: "Festive Slice",
    description: "Seasonal instalment plan for festive retail spend.",
    tenures: [tenure("3", "1000", "50000"), tenure("6", "1000", "99999999")],
    actionDate: "21-Apr-2029",
    actionType: "Add",
    channel: "POS",
    acquirer: "NI",
    sliceFlag: "2",
    subvention: "0.00",
    expiryDate: "31-Dec-2099",
    merchantFeeTyp: "P",
    merchantFee: "2.00",
    bankRevPer: "50.00",
    merchantCommissionType: "P",
    merchantCommission: "2.00",
    createdAt: "10 Sep 2026",
  },
  {
    offerId: "FAB0002",
    name: "Everyday Flex",
    description: "Everyday instalment plan with extended tenure options.",
    tenures: [
      tenure("6", "500", "25000"),
      tenure("9", "500", "60000"),
      tenure("12", "1000", "99999999"),
    ],
    actionDate: "01-Jun-2029",
    actionType: "Add",
    channel: "ECOM",
    acquirer: "NI",
    sliceFlag: "2",
    subvention: "1.50",
    expiryDate: "31-Dec-2099",
    merchantFeeTyp: "P",
    merchantFee: "2.25",
    bankRevPer: "45.00",
    merchantCommissionType: "P",
    merchantCommission: "2.25",
    createdAt: "12 Sep 2026",
  },
  {
    offerId: "ENBD0011",
    name: "Weekend Plan",
    description: "Short-tenure weekend promotion for POS spend.",
    tenures: [tenure("3", "750", "40000")],
    actionDate: "15-Mar-2029",
    actionType: "Add",
    channel: "POS",
    acquirer: "NI",
    sliceFlag: "3",
    subvention: "0.00",
    expiryDate: "30-Jun-2030",
    merchantFeeTyp: "P",
    merchantFee: "1.75",
    bankRevPer: "55.00",
    merchantCommissionType: "F",
    merchantCommission: "35.00",
    createdAt: "14 Sep 2026",
  },
  {
    offerId: "ADCB0021",
    name: "Travel Slice",
    description: "Instalment plan for travel and airline merchants.",
    tenures: [
      tenure("6", "2000", "80000"),
      tenure("12", "2000", "99999999"),
    ],
    actionDate: "10-Jan-2030",
    actionType: "Add",
    channel: "ECOM",
    acquirer: "NI",
    sliceFlag: "2",
    subvention: "2.00",
    expiryDate: "31-Dec-2099",
    merchantFeeTyp: "P",
    merchantFee: "2.50",
    bankRevPer: "40.00",
    merchantCommissionType: "P",
    merchantCommission: "2.50",
    createdAt: "18 Sep 2026",
  },
  {
    offerId: "MSHQ0031",
    name: "Electronics Plan",
    description: "Flat-fee instalment plan for electronics retailers.",
    tenures: [
      tenure("3", "1500", "30000", { feeType: "F" }),
      tenure("6", "1500", "70000", { feeType: "F" }),
    ],
    actionDate: "05-Feb-2030",
    actionType: "Add",
    channel: "POS",
    acquirer: "NI",
    sliceFlag: "3",
    subvention: "0.00",
    expiryDate: "31-Dec-2099",
    merchantFeeTyp: "P",
    merchantFee: "3.00",
    bankRevPer: "35.00",
    merchantCommissionType: "F",
    merchantCommission: "50.00",
    createdAt: "22 Sep 2026",
  },
  {
    offerId: "CBD0041",
    name: "Back to School",
    description: "Seasonal plan for education and stationery merchants.",
    tenures: [tenure("6", "1000", "45000")],
    actionDate: "20-Aug-2029",
    actionType: "Add",
    channel: "ECOM",
    acquirer: "NI",
    sliceFlag: "2",
    subvention: "1.00",
    expiryDate: "31-Aug-2030",
    merchantFeeTyp: "P",
    merchantFee: "2.10",
    bankRevPer: "48.00",
    merchantCommissionType: "P",
    merchantCommission: "2.10",
    createdAt: "25 Sep 2026",
  },
]

function binGroup(
  groupName: string,
  bankName: string,
  bankShortName: string,
  bin: string,
  createdAt: string,
  overrides: Partial<BinGroup> = {},
): BinGroup {
  return {
    action: "Add",
    groupName,
    bankName,
    bankShortName,
    bin,
    revenueSharingFrequency: "M",
    iban: `AE07033123456789012${bankShortName.slice(0, 3).toUpperCase()}`.slice(
      0,
      23,
    ),
    agentCode: "AG01",
    paymentMode: "FN",
    currency: "AED",
    addressLine1: "Corniche Road, Tower 2",
    addressLine2: "Business Bay",
    addressLine3: "PO Box 1234",
    city: "Abu Dhabi",
    panLength: "16",
    prefixLength: "6",
    flg: "Y",
    shrgFlg: groupName,
    swiftCode: "",
    routingNumber: "",
    skipPsn: "N",
    createdAt,
    ...overrides,
  }
}

export const seedBins: BinGroup[] = [
  binGroup("E1", "First Abu Dhabi Bank", "FAB", "411111", "10 Sep 2026", {
    swiftCode: "NBADAEAA",
    routingNumber: "302620101",
  }),
  binGroup("E2", "Emirates NBD", "ENBD", "517234", "12 Sep 2026", {
    revenueSharingFrequency: "D",
    swiftCode: "EBILAEAD",
  }),
  binGroup("E3", "Abu Dhabi Commercial Bank", "ADCB", "607000", "14 Sep 2026", {
    paymentMode: "EQ",
    city: "Dubai",
  }),
  binGroup("E4", "Mashreq Bank", "MSHQ", "521234", "18 Sep 2026", {
    paymentMode: "OB",
    panLength: "19",
    city: "Dubai",
  }),
  binGroup("E5", "Commercial Bank of Dubai", "CBD", "456701", "22 Sep 2026", {
    revenueSharingFrequency: "D",
    city: "Dubai",
  }),
]

function mapping(
  id: string,
  offerId: string,
  merchantId: string,
  groupName: string,
  createdAt: string,
  channel: Mapping["channel"] = "POS",
): Mapping {
  return {
    id,
    offerId,
    merchantId,
    groupName,
    actionDate: "21-Apr-2029",
    action: "Integrate",
    channel,
    acquirer: "NI",
    createdAt,
  }
}

export const seedMappings: Mapping[] = [
  mapping("MAP-001", "FAB0001", "001111093027", "E1", "15 Apr 2026"),
  mapping("MAP-002", "FAB0002", "001111093104", "E2", "18 Apr 2026", "ECOM"),
  mapping("MAP-003", "FAB0001", "001111093155", "E1", "02 May 2026"),
  mapping("MAP-004", "ENBD0011", "001111093208", "E2", "11 May 2026"),
  mapping("MAP-005", "ADCB0021", "001111093311", "E3", "26 May 2026", "ECOM"),
  mapping("MAP-006", "MSHQ0031", "001111093402", "E4", "08 Jun 2026"),
  mapping("MAP-007", "CBD0041", "001111093517", "E5", "19 Jun 2026", "ECOM"),
  mapping("MAP-008", "FAB0002", "001111093620", "E2", "30 Jun 2026"),
]

const bulkOffersCsv = `offer_id,offer_name,tenor,min_amount,max_amount,fee_type,slice_flag,channel,acquirer,action_date,expiry_date,merchant_fee,bank_rev_per
FAB0007,Bulk Offer FAB0007,3,1000,40000,P,2,POS,NI,01-Nov-2029,31-Dec-2099,2.00,50.00
FAB0007,Bulk Offer FAB0007,6,1000,90000,P,2,POS,NI,01-Nov-2029,31-Dec-2099,2.00,50.00
ENBD0014,Bulk Offer ENBD0014,6,500,35000,P,2,ECOM,NI,01-Nov-2029,31-Dec-2099,2.20,45.00
`

export const seedRequests: ChangeRequest[] = [
  {
    id: "REQ-1042",
    type: "Offer",
    action: "Add",
    entityName: "FAB0006 · Ramadan Slice",
    submittedBy: MAKER_NAME,
    submittedOn: "28 Sep 2026, 09:12",
    status: "Pending",
    audit: [
      {
        label: "Add request submitted for approval",
        actor: MAKER_NAME,
        at: "28 Sep 2026, 09:12",
      },
    ],
    payload: {
      offer: {
        offerId: "FAB0006",
        name: "Ramadan Slice",
    description: "Ramadan seasonal instalment plan.",
        tenures: [tenure("3", "1000", "35000"), tenure("6", "1000", "70000")],
        actionDate: "01-Mar-2030",
        actionType: "Add",
        channel: "POS",
        acquirer: "NI",
        sliceFlag: "2",
        subvention: "1.25",
        expiryDate: "31-Dec-2099",
        merchantFeeTyp: "P",
        merchantFee: "2.00",
        bankRevPer: "50.00",
        merchantCommissionType: "P",
        merchantCommission: "2.00",
        createdAt: "28 Sep 2026",
      },
    },
  },
  {
    id: "REQ-1043",
    type: "Bin",
    action: "Modify",
    entityName: "E4 · Mashreq Bank",
    targetId: "E4",
    submittedBy: MAKER_NAME,
    submittedOn: "28 Sep 2026, 10:18",
    status: "Pending",
    changes: [
      { field: "Revenue sharing frequency", oldValue: "M", newValue: "D" },
      { field: "Payment Mode", oldValue: "OB", newValue: "EQ" },
      { field: "PAN-LGTH", oldValue: "19", newValue: "16" },
    ],
    audit: [
      {
        label: "Modify request submitted for approval",
        actor: MAKER_NAME,
        at: "28 Sep 2026, 10:18",
      },
    ],
    payload: {
      bin: {
        ...seedBins[3],
        revenueSharingFrequency: "D",
        paymentMode: "EQ",
        panLength: "16",
      },
    },
  },
  {
    id: "REQ-1044",
    type: "Mapping",
    action: "Unlink",
    entityName: "CBD0041 · 001111093517",
    targetId: "MAP-007",
    submittedBy: MAKER_NAME,
    submittedOn: "29 Sep 2026, 11:30",
    status: "Pending",
    audit: [
      {
        label: "Unlink request submitted for approval",
        actor: MAKER_NAME,
        at: "29 Sep 2026, 11:30",
      },
    ],
    payload: { mapping: seedMappings[6] },
  },
  {
    id: "REQ-1045",
    type: "Offer",
    action: "Bulk Upload",
    entityName: "offers_batch_sep.csv",
    submittedBy: MAKER_NAME,
    submittedOn: "29 Sep 2026, 14:05",
    status: "Pending",
    file: {
      name: "offers_batch_sep.csv",
      sizeLabel: "3.1 KB",
      rowCount: 3,
      csv: bulkOffersCsv,
    },
    audit: [
      {
        label: "Add request submitted for approval",
        actor: MAKER_NAME,
        at: "29 Sep 2026, 14:05",
      },
    ],
    payload: {
      offers: [
        {
          offerId: "FAB0007",
          name: "Bulk Offer FAB0007",
          description: "Created from offers_batch_sep.csv",
          tenures: [tenure("3", "1000", "40000"), tenure("6", "1000", "90000")],
          actionDate: "01-Nov-2029",
          actionType: "Add",
          channel: "POS",
          acquirer: "NI",
          sliceFlag: "2",
          subvention: "0.00",
          expiryDate: "31-Dec-2099",
          merchantFeeTyp: "P",
          merchantFee: "2.00",
          bankRevPer: "50.00",
          merchantCommissionType: "P",
          merchantCommission: "2.00",
          createdAt: "29 Sep 2026",
        },
        {
          offerId: "ENBD0014",
          name: "Bulk Offer ENBD0014",
          description: "Created from offers_batch_sep.csv",
          tenures: [tenure("6", "500", "35000")],
          actionDate: "01-Nov-2029",
          actionType: "Add",
          channel: "ECOM",
          acquirer: "NI",
          sliceFlag: "2",
          subvention: "0.00",
          expiryDate: "31-Dec-2099",
          merchantFeeTyp: "P",
          merchantFee: "2.20",
          bankRevPer: "45.00",
          merchantCommissionType: "P",
          merchantCommission: "2.20",
          createdAt: "29 Sep 2026",
        },
      ],
    },
  },
]

export const seedFeedFiles: PortalFile[] = [
  {
    id: "FEED-004",
    title: "SLICE_FEED_20260929_2200.csv",
    timestamp: "29 Sep 2026, 22:00",
    csv: "record_type,offer_id,status\nOFFER,FAB0001,SENT\n",
  },
  {
    id: "FEED-003",
    title: "SLICE_FEED_20260929_1400.csv",
    timestamp: "29 Sep 2026, 14:00",
    csv: "record_type,offer_id,status\nOFFER,FAB0002,SENT\n",
  },
  {
    id: "FEED-002",
    title: "SLICE_FEED_20260928_2200.csv",
    timestamp: "28 Sep 2026, 22:00",
    csv: "record_type,bin_group,status\nBIN,E3,SENT\n",
  },
  {
    id: "FEED-001",
    title: "SLICE_FEED_20260928_1400.csv",
    timestamp: "28 Sep 2026, 14:00",
    csv: "record_type,mid,status\nMAPPING,001111093027,SENT\n",
  },
]

export const seedResponseFiles: PortalFile[] = [
  {
    id: "RESP-004",
    title: "SLICE_RESPONSE_20260929_2200.csv",
    timestamp: "29 Sep 2026, 22:35",
    csv: "record_type,offer_id,result,reason\nOFFER,FAB0001,ACCEPTED,\n",
  },
  {
    id: "RESP-003",
    title: "SLICE_RESPONSE_20260929_1400.csv",
    timestamp: "29 Sep 2026, 14:32",
    csv: "record_type,offer_id,result,reason\nOFFER,FAB0002,ACCEPTED,\n",
  },
  {
    id: "RESP-002",
    title: "SLICE_RESPONSE_20260928_2200.csv",
    timestamp: "28 Sep 2026, 22:28",
    csv: "record_type,bin_group,result,reason\nBIN,E3,REJECTED,DUPLICATE_BIN\n",
  },
  {
    id: "RESP-001",
    title: "SLICE_RESPONSE_20260928_1400.csv",
    timestamp: "28 Sep 2026, 14:26",
    csv: "record_type,mid,result,reason\nMAPPING,001111093027,ACCEPTED,\n",
  },
]

export const SAMPLE_CSV: Record<"Offer" | "Bin" | "Mapping", string> = {
  Offer:
    "offer_id,offer_name,tenor,min_amount,max_amount,fee_type,slice_flag,channel,acquirer,action_date,expiry_date,merchant_fee,bank_rev_per\nFAB0009,Festive Slice 10%,3,1000,40000,P,2,POS,NI,01-Dec-2029,31-Dec-2099,2.00,50.00\n",
  Bin: "bin_group,bank_name,bank_short_name,bin,rev_share_freq,iban,agent_code,payment_mode,currency,pan_length,prefix_length,shrg_flg\nE6,Ajman Bank,AJMN,412300,M,AE070331234567890123456,AG06,FN,AED,16,6,E6\n",
  Mapping:
    "offer_id,merchant_id,group_bin_share,action,channel,acquirer,action_date\nFAB0001,001111094001,E1,Integrate,POS,NI,21-Apr-2029\n",
}
