import { useState } from "react"
import { Download } from "lucide-react"
import { useStore } from "../store"
import { downloadTextFile } from "../lib/format"
import {
  Button,
  DataTable,
  EmptyState,
  PageTitle,
  Row,
  cn,
} from "../components/primitives"

export function FeedResponse() {
  const { feedFiles, responseFiles, pushToast } = useStore()
  const [tab, setTab] = useState<"Feed" | "Response">("Feed")

  return (
    <>
      <PageTitle title="Feed & Response Files" />

      <div className="mb-4 flex gap-1 border-b border-border">
        {(["Feed", "Response"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={cn(
              "border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors",
              tab === option
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-portal-ink",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {tab === "Feed" ? (
        <DataTable
          headers={["Title", "Timestamp"]}
          equalColumns
          empty={
            feedFiles.length === 0 ? (
              <EmptyState title="No feed files generated yet" />
            ) : undefined
          }
        >
          {feedFiles.map((file, index) => (
            <Row key={file.id} index={index}>
              <td className="px-4 py-3 font-medium text-portal-ink">
                {file.title}
              </td>
              <td className="px-4 py-3">{file.timestamp}</td>
            </Row>
          ))}
        </DataTable>
      ) : (
        <DataTable
          headers={["Title", "Timestamp", "Actions"]}
          empty={
            responseFiles.length === 0 ? (
              <EmptyState title="No response files received yet" />
            ) : undefined
          }
        >
          {responseFiles.map((file, index) => (
            <Row key={file.id} index={index}>
              <td className="px-4 py-3 font-medium text-portal-ink">
                {file.title}
              </td>
              <td className="px-4 py-3">{file.timestamp}</td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    downloadTextFile(file.title, file.csv)
                    pushToast(`${file.title} downloaded`)
                  }}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
              </td>
            </Row>
          ))}
        </DataTable>
      )}
    </>
  )
}
