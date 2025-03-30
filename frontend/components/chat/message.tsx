import { cn } from "@/lib/utils"

type MessageProps = {
  content: string
  isUser: boolean
  timestamp: string | Date
}

export function Message({ content, isUser, timestamp }: MessageProps) {
  const formattedTime =
    typeof timestamp === "string"
      ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : (timestamp as Date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div className={cn("text-xs mt-1", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formattedTime}
        </div>
      </div>
    </div>
  )
}

