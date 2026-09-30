export type Role = "Slice Admin Maker" | "Slice Admin Checker" | "Unauthorized"

export type Channel = "POS" | "ECOM"
export type FeeType = "F" | "P"
export type SliceFlag = "2" | "3"
export type PaymentMode = "FN" | "EQ" | "OB"

export type Tenure = {
  tenor: string
  minAmount: string
  maxAmount: string
  feeType: FeeType
  commissionType: FeeType
  minCommission: string
  maxCommission: string
}

export type Offer = {
  offerId: string
  name: string
  description: string
  tenures: Tenure[]
  actionDate: string
  actionType: "Add" | "Modify"
  channel: Channel
  acquirer: "NI"
  sliceFlag: SliceFlag
  subvention: string
  expiryDate: string
  merchantFeeTyp: "P"
  merchantFee: string
  bankRevPer: string
  merchantCommissionType: FeeType
  merchantCommission: string
  createdAt: string
}

export type BinGroup = {
  action: "Add" | "Modify" | "Delete"
  groupName: string
  bankName: string
  bankShortName: string
  bin: string
  revenueSharingFrequency: "D" | "M"
  iban: string
  agentCode: string
  paymentMode: PaymentMode
  currency: "AED"
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  panLength: string
  prefixLength: string
  flg: string
  shrgFlg: string
  swiftCode: string
  routingNumber: string
  skipPsn: string
  createdAt: string
}

export type Mapping = {
  id: string
  offerId: string
  merchantId: string
  groupName: string
  actionDate: string
  action: "Integrate" | "Delete"
  channel: Channel
  acquirer: "NI"
  createdAt: string
}

export type RequestType = "Offer" | "Bin" | "Mapping"
export type RequestAction =
  | "Add"
  | "Modify"
  | "Delete"
  | "Unlink"
  | "Bulk Upload"
export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"

export type FieldValue = { field: string; value: string }
export type FieldChange = { field: string; oldValue: string; newValue: string }
export type AuditEntry = { label: string; actor: string; at: string }

export type BulkFile = {
  name: string
  sizeLabel: string
  rowCount: number
  csv: string
}

export type ChangeRequest = {
  id: string
  type: RequestType
  action: RequestAction
  entityName: string
  targetId?: string
  submittedBy: string
  submittedOn: string
  status: RequestStatus
  summary?: FieldValue[]
  changes?: FieldChange[]
  file?: BulkFile
  checkerComment?: string
  audit: AuditEntry[]
  payload?: {
    offer?: Offer
    bin?: BinGroup
    mapping?: Mapping
    offers?: Offer[]
    bins?: BinGroup[]
    mappings?: Mapping[]
  }
}

export type PortalFile = {
  id: string
  title: string
  timestamp: string
  csv: string
}

export type Route =
  | { name: "hub" }
  | { name: "offers" }
  | { name: "offer-details"; offerId: string }
  | { name: "bins" }
  | { name: "bin-details"; groupName: string }
  | { name: "mapping" }
  | { name: "review"; requestId: string }
  | { name: "requested" }
  | { name: "feed" }

export type Toast = {
  id: number
  message: string
  tone: "success" | "error" | "info"
}
