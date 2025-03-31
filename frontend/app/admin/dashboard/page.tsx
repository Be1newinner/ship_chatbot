"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, BarChart } from "lucide-react"
import { useUserCount, useSessionCount } from "@/hooks/use-api"

export default function AdminDashboard() {
  const { data: userCountData, isLoading: isLoadingUserCount } = useUserCount()
  const { data: sessionCountData, isLoading: isLoadingSessionCount } = useSessionCount()

  // Hardcoded response rate for demo
  const responseRate = 98.5

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUserCount ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{userCountData?.total_users || 0}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSessionCount ? (
              <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{sessionCountData?.total_sessions || 0}</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of recent user interactions with the chat bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">User #{Math.floor(Math.random() * 1000)}</p>
                  <p className="text-sm text-muted-foreground">
                    {i % 2 === 0 ? "Asked about product features" : "Requested support"}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(Date.now() - i * 3600000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

