# Slice Configuration — interactive demo

Mock UI for the Network International Portal **EPP Slice Configuration** module
(Epic NINGG-33290). No backend: all state is local and resets on reload.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Roles

Settings → Slice Configuration is the entry page; it lists only the sections
the current role may open. Switch role from the top bar.

| Role | Sees | Can |
| --- | --- | --- |
| Slice Admin Maker | Offers, BINs, Merchant Mapping, Requested Queue, Feed & Response Files | New/Map, Modify, Delete/Unlink, Bulk Upload |
| Slice Admin Checker | Requested Queue only | Review, Approve, Reject |
| Unauthorized | Blocked page | Nothing |

The Requested Queue is one page with role-dependent content: the Checker sees
only pending requests and reviews them; the Maker sees every request he
submitted and its outcome. Approved configuration is labelled **Active**, and
bulk uploads appear as an **Add** action.

## Maker–Checker rules

- Maker submits Add / Modify / Delete / Unlink / Bulk Upload — nothing applies immediately.
- Submitting shows a toast and creates a Pending request in both the Maker's
  Requested Queue and the Checker's Approval Queue.
- Offers / BINs / Mapping lists show approved records only.
- Approve applies the change; Reject does not. Either decision removes the
  request from the Approval Queue.
- A bulk CSV creates exactly one request for the whole file; approval expands it
  into one row per record.

## Demo flows

1. **Offer add** — Maker → Offers → New → submit → switch to Checker → Review →
   Approve → switch back to Maker → offer is listed → open Offer Details.
2. **Bulk mapping** — Maker → Merchant Mapping → Upload Mapping File → submit →
   Checker downloads the file → Approve → rows appear.
3. **Rejected unlink** — Maker unlinks a mapping → Checker rejects → mapping stays.
4. **Feed files** — Maker → Feed & Response Files → Response tab → Download.
5. **Blocked** — switch to Unauthorized.

`FAB0001` and BIN group `E1` are linked by existing mappings, so their Delete
action is disabled with the helper text "Cannot delete while linked".

## Tickets covered

NINGG-33355 (Offers list) · NINGG-33849 (Offer details) · NINGG-33635 (BINs) ·
NINGG-33809 (Merchant Mapping) · NINGG-33845 (Bulk upload) · NINGG-33842
(Approval Queue + Review) · NINGG-33847 (Feed & Response Files)

Out of scope: Merchant Owner role, merchant commission page, commission queue type.
