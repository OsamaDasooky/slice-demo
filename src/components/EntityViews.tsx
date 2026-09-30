import { feeTypeLabel, formatAmount, sliceFlagLabel } from "../lib/format"
import type { BinGroup, Mapping, Offer } from "../types"
import { DetailGrid, Row, SectionTitle } from "./primitives"

export function OfferDetailView({ offer }: { offer: Offer }) {
  return (
    <>
      <SectionTitle title="Tenure details" />
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Tenor</th>
              <th className="px-4 py-3">Min Amt</th>
              <th className="px-4 py-3">Max Amt</th>
              <th className="px-4 py-3">Fee Type</th>
              <th className="px-4 py-3">Comm. Type</th>
              <th className="px-4 py-3">Min Comm.</th>
              <th className="px-4 py-3">Max Comm.</th>
            </tr>
          </thead>
          <tbody>
            {offer.tenures.map((tenure, index) => (
              <Row key={`${tenure.tenor}-${index}`} index={index}>
                <td className="px-4 py-3 font-semibold text-portal-ink">
                  {tenure.tenor}
                </td>
                <td className="px-4 py-3">{formatAmount(tenure.minAmount)}</td>
                <td className="px-4 py-3">{formatAmount(tenure.maxAmount)}</td>
                <td className="px-4 py-3">{tenure.feeType}</td>
                <td className="px-4 py-3">
                  {tenure.commissionType === "P" ? "Percentage" : "Flat"}
                </td>
                <td className="px-4 py-3">{tenure.minCommission || "—"}</td>
                <td className="px-4 py-3">{tenure.maxCommission || "—"}</td>
              </Row>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle title="Offer details" />
      <DetailGrid
        items={[
          { label: "Description", value: offer.description || "—" },
          { label: "Action Type", value: offer.actionType },
          { label: "Channel", value: offer.channel },
          { label: "Acquirer", value: offer.acquirer },
          { label: "Subvention %", value: offer.subvention || "0.00" },
          { label: "Slice Flag", value: sliceFlagLabel(offer.sliceFlag) },
          { label: "Expiry Date", value: offer.expiryDate || "—" },
          { label: "Action Date", value: offer.actionDate },
          {
            label: "Merchant Fee TYP",
            value: feeTypeLabel(offer.merchantFeeTyp),
          },
          { label: "Merchant Fee", value: offer.merchantFee || "—" },
          { label: "Bank Rev Per", value: offer.bankRevPer || "—" },
          {
            label: "Merchant Commission Type",
            value: feeTypeLabel(offer.merchantCommissionType),
          },
          {
            label: "Merchant Commission",
            value: offer.merchantCommission || "—",
          },
          { label: "Creation Date", value: offer.createdAt || "—" },
        ]}
      />
    </>
  )
}

export function BinDetailView({ bin }: { bin: BinGroup }) {
  return (
    <>
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">BIN</th>
              <th className="px-4 py-3">PAN Length</th>
              <th className="px-4 py-3">Prefix Length</th>
              <th className="px-4 py-3">FLG</th>
              <th className="px-4 py-3">SHRG-FLG</th>
              <th className="px-4 py-3">Skip PSN</th>
            </tr>
          </thead>
          <tbody>
            <Row index={1}>
              <td className="px-4 py-3 font-semibold text-portal-ink">
                {bin.bin}
              </td>
              <td className="px-4 py-3">{bin.panLength}</td>
              <td className="px-4 py-3">{bin.prefixLength}</td>
              <td className="px-4 py-3">{bin.flg}</td>
              <td className="px-4 py-3">{bin.shrgFlg}</td>
              <td className="px-4 py-3">{bin.skipPsn || "—"}</td>
            </Row>
          </tbody>
        </table>
      </div>

      <DetailGrid
        items={[
          { label: "Bank Name", value: bin.bankName || "—" },
          { label: "Bank Short Name", value: bin.bankShortName || "—" },
          { label: "BIN Group Name", value: bin.groupName },
          {
            label: "Revenue Sharing Frequency",
            value: bin.revenueSharingFrequency === "D" ? "Daily" : "Monthly",
          },
          { label: "Currency", value: bin.currency },
          { label: "Payment Mode", value: bin.paymentMode },
          { label: "IBAN", value: bin.iban || "—" },
          { label: "SWIFT", value: bin.swiftCode || "—" },
          { label: "Routing Number", value: bin.routingNumber || "—" },
          { label: "Agent Code", value: bin.agentCode || "—" },
          { label: "City", value: bin.city || "—" },
          { label: "Creation Date", value: bin.createdAt || "—" },
          { label: "Address Line 1", value: bin.addressLine1 || "—" },
          { label: "Address Line 2", value: bin.addressLine2 || "—" },
          { label: "Address Line 3", value: bin.addressLine3 || "—" },
        ]}
      />
    </>
  )
}

export function MappingDetailView({ mapping }: { mapping: Mapping }) {
  return (
    <>
      <SectionTitle title="Mapping details" />
      <DetailGrid
        items={[
          { label: "Offer ID", value: mapping.offerId },
          { label: "Merchant ID", value: mapping.merchantId },
          { label: "Group / BIN Share", value: mapping.groupName },
        ]}
      />
    </>
  )
}
