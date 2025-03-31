"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { DataPagination } from "@/components/ui/data-pagination"
import { useChatDetails } from "@/hooks/use-api"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ChatMessage {
  message: string
  timestamp: string
}

export default function ChatDetailPage() {
  const { sessionId } = useParams() as { sessionId: string }
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data, isLoading } = useChatDetails(sessionId, page, pageSize)
  const messages = data?.data || []
  const totalMessages = data?.total_chats || 0

  const columns = [
    {
      header: "Message",
      accessor: "message",
      className: "max-w-md truncate",
    },
    {
      header: "Timestamp",
      accessor: (message: ChatMessage) => format(new Date(message.timestamp), "PPpp"),
      className: "whitespace-nowrap",
    },
  ]

  const totalPages = Math.ceil(totalMessages / pageSize)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/chats">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Chat Session: {sessionId}</h1>
      </div>

      <DataTable columns={columns} data={messages} isLoading={isLoading} />

      <DataPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

