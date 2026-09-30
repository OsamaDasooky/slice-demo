import { useStore } from "../store"
import { moduleSections } from "../components/ModuleTabs"

export function SliceConfigHub() {
  const { role, navigate } = useStore()
  const sections = moduleSections(role)

  return (
    <>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        Payment configuration
      </p>
      <h1 className="text-[2.35rem] font-light leading-tight text-portal-ink">
        Slice Configuration
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Configure flexible payment offers, eligible cards, merchant mappings,
        and submitted changes.
      </p>

      <div className="mt-8 border-t border-border">
        {sections.map((section) => (
          <button
            key={section.label}
            type="button"
            onClick={() => navigate(section.route)}
            className="group block w-full border-b border-border py-6 text-left"
          >
            <span className="text-lg font-medium text-primary underline decoration-primary underline-offset-4 group-hover:opacity-80">
              {section.label}
            </span>
            <span className="mt-1.5 block text-sm text-muted-foreground">
              {section.description}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
