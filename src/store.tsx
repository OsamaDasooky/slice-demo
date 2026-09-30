import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  CHECKER_NAME,
  MAKER_NAME,
  seedBins,
  seedFeedFiles,
  seedMappings,
  seedOffers,
  seedRequests,
  seedResponseFiles,
} from "./data/seed"
import { actionLabel, formatCreationDate, formatTimestamp } from "./lib/format"
import type {
  BinGroup,
  ChangeRequest,
  Mapping,
  Offer,
  PortalFile,
  RequestType,
  Role,
  Route,
  Toast,
} from "./types"

type NewRequest = Omit<
  ChangeRequest,
  "id" | "submittedBy" | "submittedOn" | "status" | "audit"
>

type StoreValue = {
  role: Role
  setRole: (role: Role) => void
  route: Route
  navigate: (route: Route) => void

  offers: Offer[]
  bins: BinGroup[]
  mappings: Mapping[]
  requests: ChangeRequest[]
  feedFiles: PortalFile[]
  responseFiles: PortalFile[]

  pendingRequests: ChangeRequest[]
  submitRequest: (request: NewRequest) => void
  decideRequest: (
    id: string,
    decision: "Approved" | "Rejected",
    comment: string,
  ) => void
  cancelRequest: (id: string) => void

  isOfferLinked: (offerId: string) => boolean
  isBinLinked: (groupName: string) => boolean
  hasPendingFor: (type: RequestType, targetId: string) => boolean
  findBinOwner: (bin: string, excludeGroup?: string) => BinGroup | undefined

  toasts: Toast[]
  pushToast: (message: string, tone?: Toast["tone"]) => void
  dismissToast: (id: number) => void
}

const StoreContext = createContext<StoreValue | null>(null)

const DEFAULT_ROUTE: Record<Role, Route> = {
  "Slice Admin Maker": { name: "hub" },
  "Slice Admin Checker": { name: "hub" },
  Unauthorized: { name: "hub" },
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("Slice Admin Maker")
  const [route, setRoute] = useState<Route>({ name: "hub" })
  const [offers, setOffers] = useState<Offer[]>(seedOffers)
  const [bins, setBins] = useState<BinGroup[]>(seedBins)
  const [mappings, setMappings] = useState<Mapping[]>(seedMappings)
  const [requests, setRequests] = useState<ChangeRequest[]>(seedRequests)
  const [feedFiles] = useState<PortalFile[]>(seedFeedFiles)
  const [responseFiles] = useState<PortalFile[]>(seedResponseFiles)
  const [toasts, setToasts] = useState<Toast[]>([])

  const counters = useRef({ request: 1045, toast: 0, mapping: 8 })

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      counters.current.toast += 1
      const id = counters.current.toast
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismissToast(id), 4200)
    },
    [dismissToast],
  )

  const setRole = useCallback((next: Role) => {
    setRoleState(next)
    setRoute(DEFAULT_ROUTE[next])
  }, [])

  const navigate = useCallback((next: Route) => {
    setRoute(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const submitRequest = useCallback(
    (request: NewRequest) => {
      counters.current.request += 1
      const id = `REQ-${counters.current.request}`
      const submittedOn = formatTimestamp(new Date())
      setRequests((current) => [
        {
          ...request,
          id,
          submittedBy: MAKER_NAME,
          submittedOn,
          status: "Pending",
          audit: [
            {
              label: `${actionLabel(request.action)} request submitted for approval`,
              actor: MAKER_NAME,
              at: submittedOn,
            },
          ],
        },
        ...current,
      ])
      pushToast("Request submitted for approval")
    },
    [pushToast],
  )

  const applyRequest = useCallback((request: ChangeRequest) => {
    const approvedOn = formatCreationDate(new Date())
    // Records created by a request are dated when the Checker approves them.
    const stamp = <T extends { createdAt: string }>(entity: T): T =>
      entity.createdAt && entity.createdAt !== "Pending approval"
        ? entity
        : { ...entity, createdAt: approvedOn }

    const payload = request.payload

    if (request.type === "Offer") {
      if (request.action === "Bulk Upload" && payload?.offers) {
        const incoming = payload.offers.map(stamp)
        setOffers((current) => [
          ...incoming.filter(
            (offer) =>
              !current.some((existing) => existing.offerId === offer.offerId),
          ),
          ...current,
        ])
      } else if (request.action === "Delete" && request.targetId) {
        setOffers((current) =>
          current.filter((offer) => offer.offerId !== request.targetId),
        )
      } else if (payload?.offer) {
        const incoming = stamp(payload.offer)
        setOffers((current) => {
          const exists = current.some(
            (offer) => offer.offerId === incoming.offerId,
          )
          return exists
            ? current.map((offer) =>
                offer.offerId === incoming.offerId ? incoming : offer,
              )
            : [incoming, ...current]
        })
      }
      return
    }

    if (request.type === "Bin") {
      if (request.action === "Bulk Upload" && payload?.bins) {
        const incoming = payload.bins.map(stamp)
        setBins((current) => [
          ...incoming.filter(
            (bin) =>
              !current.some((existing) => existing.groupName === bin.groupName),
          ),
          ...current,
        ])
      } else if (request.action === "Delete" && request.targetId) {
        setBins((current) =>
          current.filter((bin) => bin.groupName !== request.targetId),
        )
      } else if (payload?.bin) {
        const incoming = stamp(payload.bin)
        setBins((current) => {
          const exists = current.some(
            (bin) => bin.groupName === incoming.groupName,
          )
          return exists
            ? current.map((bin) =>
                bin.groupName === incoming.groupName ? incoming : bin,
              )
            : [incoming, ...current]
        })
      }
      return
    }

    if (request.action === "Bulk Upload" && payload?.mappings) {
      const incoming = payload.mappings.map(stamp)
      setMappings((current) => [...incoming, ...current])
    } else if (request.action === "Unlink" && request.targetId) {
      setMappings((current) =>
        current.filter((item) => item.id !== request.targetId),
      )
    } else if (payload?.mapping) {
      const incoming = stamp(payload.mapping)
      setMappings((current) => {
        const exists = current.some((item) => item.id === incoming.id)
        return exists
          ? current.map((item) => (item.id === incoming.id ? incoming : item))
          : [incoming, ...current]
      })
    }
  }, [])

  const decideRequest = useCallback(
    (id: string, decision: "Approved" | "Rejected", comment: string) => {
      const target = requests.find((request) => request.id === id)
      if (!target) return

      if (decision === "Approved") applyRequest(target)

      const at = formatTimestamp(new Date())
      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? {
                ...request,
                status: decision,
                checkerComment: comment.trim() || undefined,
                audit: [
                  ...request.audit,
                  {
                    label:
                      decision === "Approved"
                        ? "Request approved and applied"
                        : "Request rejected — configuration unchanged",
                    actor: CHECKER_NAME,
                    at,
                  },
                ],
              }
            : request,
        ),
      )
      const label = actionLabel(target.action).toLowerCase()
      pushToast(
        decision === "Approved"
          ? `${target.type} ${label} request approved`
          : `${target.type} ${label} request rejected`,
        decision === "Approved" ? "success" : "error",
      )
    },
    [applyRequest, pushToast, requests],
  )

  const cancelRequest = useCallback(
    (id: string) => {
      const at = formatTimestamp(new Date())
      setRequests((current) =>
        current.map((request) =>
          request.id === id && request.status === "Pending"
            ? {
                ...request,
                status: "Cancelled",
                audit: [
                  ...request.audit,
                  {
                    label: "Request cancelled by Maker before decision",
                    actor: MAKER_NAME,
                    at,
                  },
                ],
              }
            : request,
        ),
      )
      pushToast("Request cancelled", "info")
    },
    [pushToast],
  )

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "Pending"),
    [requests],
  )

  const isOfferLinked = useCallback(
    (offerId: string) => mappings.some((item) => item.offerId === offerId),
    [mappings],
  )

  const isBinLinked = useCallback(
    (groupName: string) => mappings.some((item) => item.groupName === groupName),
    [mappings],
  )

  const hasPendingFor = useCallback(
    (type: RequestType, targetId: string) =>
      pendingRequests.some(
        (request) => request.type === type && request.targetId === targetId,
      ),
    [pendingRequests],
  )

  const findBinOwner = useCallback(
    (bin: string, excludeGroup?: string) =>
      bins.find(
        (group) => group.groupName !== excludeGroup && group.bin === bin.trim(),
      ),
    [bins],
  )

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      route,
      navigate,
      offers,
      bins,
      mappings,
      requests,
      feedFiles,
      responseFiles,
      pendingRequests,
      submitRequest,
      decideRequest,
      cancelRequest,
      isOfferLinked,
      isBinLinked,
      hasPendingFor,
      findBinOwner,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      role,
      setRole,
      route,
      navigate,
      offers,
      bins,
      mappings,
      requests,
      feedFiles,
      responseFiles,
      pendingRequests,
      submitRequest,
      decideRequest,
      cancelRequest,
      isOfferLinked,
      isBinLinked,
      hasPendingFor,
      findBinOwner,
      toasts,
      pushToast,
      dismissToast,
    ],
  )

  return <StoreContext value={value}>{children}</StoreContext>
}

export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error("useStore must be used inside StoreProvider")
  return value
}

export function nextMappingId() {
  return `MAP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}
