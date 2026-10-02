import { createContext, useContext, type ReactNode } from "react"
import { createPortal } from "react-dom"

const PageHeadingContext = createContext<HTMLElement | null>(null)

export function PageHeadingProvider({
  host,
  children,
}: {
  host: HTMLElement | null
  children: ReactNode
}) {
  return (
    <PageHeadingContext.Provider value={host}>
      {children}
    </PageHeadingContext.Provider>
  )
}

/** Renders a list-page title into the slot above the module tabs. */
export function PageHeading({ children }: { children: ReactNode }) {
  const host = useContext(PageHeadingContext)
  if (!host) return null
  return createPortal(children, host)
}
