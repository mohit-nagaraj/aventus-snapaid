import { MessageRoleEnum, type TranscriptMessage } from "@/utils/types/conversation.type"

interface ConversationMessageProps {
  message: TranscriptMessage
}

export function ConversationMessage({ message }: ConversationMessageProps) {
  const isUser = message.role === MessageRoleEnum.USER

  return (
    <div className={`flex w-full text-sm mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* {!isUser && (
        <div className="mr-3 mt-1">
          <Avatar className="h-8 w-8 bg-purple-100 border border-purple-200">
            <Bot className="h-4 w-4 text-purple-600" />
          </Avatar>
        </div>
      )} */}

      <div
        className={`p-4 rounded-xl max-w-[80%] ${
          isUser
            ? "bg-purple-600 text-white rounded-tr-none"
            : "bg-white border border-purple-100 text-slate-800 rounded-tl-none shadow-sm"
        }`}
      >
        <p className="leading-relaxed">{message.transcript}</p>
      </div>

      {/* {isUser && (
        <div className="ml-3 mt-1">
          <Avatar className="h-8 w-8 bg-purple-600">
            <User className="h-4 w-4 text-white" />
          </Avatar>
        </div>
      )} */}
    </div>
  )
}
