import { useState } from "react"
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react"
import { useStore } from "../store"
import { SAMPLE_CSV } from "../data/seed"
import { parseBinsCsv, parseMappingsCsv, parseOffersCsv } from "../lib/csv"
import { downloadTextFile, formatCreationDate } from "../lib/format"
import type { RequestType } from "../types"
import { SidePanel } from "../components/primitives"

const MAX_BYTES = 10 * 1024 * 1024

const LABEL: Record<RequestType, string> = {
  Offer: "Offers",
  Bin: "BINs",
  Mapping: "Mapping",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BulkUploadPanel({
  open,
  type,
  onClose,
}: {
  open: boolean
  type: RequestType
  onClose: () => void
}) {
  const { submitRequest } = useStore()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const pick = (selected: File | null) => {
    if (!selected) {
      setFile(null)
      setError("")
      return
    }
    const isCsv =
      selected.type === "text/csv" || selected.name.toLowerCase().endsWith(".csv")
    if (!isCsv) {
      setFile(null)
      setError("Only CSV files are accepted.")
      return
    }
    if (selected.size > MAX_BYTES) {
      setFile(null)
      setError(`File is ${formatSize(selected.size)} — the maximum size is 10 MB.`)
      return
    }
    setError("")
    setFile(selected)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Select a CSV file to upload.")
      return
    }

    const csv = await file.text()
    const rowCount = csv
      .split("\n")
      .slice(1)
      .filter((line) => line.trim().length > 0).length

    const createdAt = formatCreationDate(new Date())
    const payload =
      type === "Offer"
        ? { offers: parseOffersCsv(csv, createdAt) }
        : type === "Bin"
          ? { bins: parseBinsCsv(csv, createdAt) }
          : { mappings: parseMappingsCsv(csv, createdAt) }

    // One request represents the whole file, never one per row.
    submitRequest({
      type,
      action: "Bulk Upload",
      entityName: file.name,
      file: {
        name: file.name,
        sizeLabel: formatSize(file.size),
        rowCount,
        csv,
      },
      payload,
      summary: [
        { field: "File name", value: file.name },
        { field: "File size", value: formatSize(file.size) },
        { field: "Records in file", value: String(rowCount) },
        { field: "Target list", value: LABEL[type] },
      ],
    })

    setFile(null)
    onClose()
  }

  return (
    <SidePanel
      open={open}
      title={`Upload ${LABEL[type]} File`}
      description="CSV only, maximum 10 MB. The whole file becomes a single approval request."
      submitLabel="Submit for approval"
      onClose={() => {
        setFile(null)
        setError("")
        onClose()
      }}
      onSubmit={handleSubmit}
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-input bg-muted/50 px-6 py-10 text-center transition-colors hover:border-primary">
        <UploadCloud className="size-8 text-primary" />
        <span className="text-sm font-semibold text-portal-ink">
          Choose a CSV file
        </span>
        <span className="text-xs text-muted-foreground">
          Drag and drop is not required for this demo
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0] ?? null)}
        />
      </label>

      {file && (
        <div className="mt-4 flex items-center gap-3 border border-border bg-card px-4 py-3">
          <FileSpreadsheet className="size-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-portal-ink">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 border-l-4 border-destructive bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          downloadTextFile(
            `sample_${type.toLowerCase()}_upload.csv`,
            SAMPLE_CSV[type === "Bin" ? "Bin" : type === "Mapping" ? "Mapping" : "Offer"],
          )
        }
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <Download className="size-4" />
        Download sample file
      </button>

    </SidePanel>
  )
}
