"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { DataPagination } from "@/components/ui/data-pagination"
import { useUsers } from "@/hooks/use-api"
import { format } from "date-fns"

interface User {
  _id: string
  username: string
  email: string
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data, isLoading } = useUsers(page, pageSize)
  const users = data?.data || []
  const totalUsers = data?.total_users || 0

  const columns = [
    {
      header: "Username",
      accessor: "username",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role",
    },
    {
      header: "Created At",
      accessor: (user: User) => format(new Date(user.created_at), "PPpp"),
    },
  ]

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Users</h1>

      <DataTable columns={columns} data={users} isLoading={isLoading} />

      <DataPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

