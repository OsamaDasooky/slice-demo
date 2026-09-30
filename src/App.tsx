import { Breadcrumb, Header } from "./components/Header"
import { ModuleTabs, moduleSections } from "./components/ModuleTabs"
import { Toaster } from "./components/Toaster"
import { StoreProvider, useStore } from "./store"
import { BinDetails } from "./pages/BinDetails"
import { BinsList } from "./pages/BinsList"
import { Blocked } from "./pages/Blocked"
import { FeedResponse } from "./pages/FeedResponse"
import { MerchantMapping } from "./pages/MerchantMapping"
import { OfferDetails } from "./pages/OfferDetails"
import { OffersList } from "./pages/OffersList"
import { RequestedQueue } from "./pages/RequestedQueue"
import { ReviewRequest } from "./pages/ReviewRequest"
import { SliceConfigHub } from "./pages/SliceConfigHub"
import type { Role, Route } from "./types"

const PAGE_LABEL: Record<Route["name"], string> = {
  hub: "Slice Configuration",
  offers: "Offers",
  "offer-details": "Offer details",
  bins: "BINs",
  "bin-details": "BIN details",
  mapping: "Merchant Mapping",
  review: "Request details",
  requested: "Requested Queue",
  feed: "Feed & Response Files",
}

/** A role may only land on pages its own module sections expose. */
function isRouteAllowed(role: Role, route: Route) {
  if (route.name === "hub") return true
  const owned = new Set(moduleSections(role).map((section) => section.route.name))
  if (route.name === "offer-details") return owned.has("offers")
  if (route.name === "bin-details") return owned.has("bins")
  if (route.name === "review") return owned.has("requested")
  return owned.has(route.name)
}

function CurrentPage() {
  const { role, route } = useStore()

  if (role === "Unauthorized") return <Blocked />
  if (!isRouteAllowed(role, route)) return <SliceConfigHub />

  switch (route.name) {
    case "offers":
      return <OffersList />
    case "offer-details":
      return <OfferDetails offerId={route.offerId} />
    case "bins":
      return <BinsList />
    case "bin-details":
      return <BinDetails groupName={route.groupName} />
    case "mapping":
      return <MerchantMapping />
    case "requested":
      return <RequestedQueue />
    case "review":
      return <ReviewRequest requestId={route.requestId} />
    case "feed":
      return <FeedResponse />
    default:
      return <SliceConfigHub />
  }
}

function Shell() {
  const { role, route } = useStore()
  const onHub = role === "Unauthorized" || route.name === "hub"

  const leaf =
    route.name === "bin-details"
      ? `BIN ${route.groupName}`
      : route.name === "offer-details"
        ? `Offer ${route.offerId}`
        : PAGE_LABEL[route.name]

  const trail: Array<{ label: string; route?: Route }> = onHub
    ? [{ label: "Settings" }, { label: "Slice Configuration" }]
    : [
        { label: "Settings" },
        { label: "Slice Configuration", route: { name: "hub" } },
        { label: leaf },
      ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumb trail={trail} />
      <ModuleTabs />
      <main className="mx-auto max-w-[1200px] px-5 py-8">
        <CurrentPage />
      </main>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
