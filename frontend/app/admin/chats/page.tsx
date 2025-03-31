"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { DataPagination } from "@/components/ui/data-pagination"
import { useChatSessions } from "@/hooks/use-api"
import { format } from "date-fns"

interface ChatSession {
  user_id: string
  session_id: string
  created_at: string
}

export default function AdminChatsPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const router = useRouter()

  const { data, isLoading } = useChatSessions(page, pageSize)
  const sessions = data?.data || []
  const totalSessions = data?.total_sessions || 0

  const handleRowClick = (session: ChatSession) => {
    router.push(`/admin/chats/${session.session_id}`)
  }

  const columns = [
    {
      header: "Session ID",
      accessor: "session_id",
    },
    {
      header: "User ID",
      accessor: "user_id",
    },
    {
      header: "Created At",
      accessor: (session: ChatSession) => format(new Date(session.created_at), "PPpp"),
    },
  ]

  const totalPages = Math.ceil(totalSessions / pageSize)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Chat Sessions</h1>

      <DataTable columns={columns} data={sessions} onRowClick={handleRowClick} isLoading={isLoading} />

      <DataPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

