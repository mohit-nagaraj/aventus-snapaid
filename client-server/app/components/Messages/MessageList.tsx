import { type Message, MessageTypeEnum, type TranscriptMessage } from "@/utils/types/conversation.type"
import { ConversationMessage } from "./ConversationMessage"
import FunctionCallResult from "./FunctionCallResult"

interface MessageListProps {
  messages: Message[]
  activeTranscript?: TranscriptMessage | null
}

export function MessageList({ messages, activeTranscript }: MessageListProps) {
  if (messages.length === 0 && !activeTranscript) {
    return null
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) =>
        message.type === MessageTypeEnum.TRANSCRIPT ? (
          <ConversationMessage message={message} key={message.type + message?.role + index} />
        ) : message.type === MessageTypeEnum.FUNCTION_CALL_RESULT ? (
          <FunctionCallResult key={message.type + index} message={message} />
        ) : null,
      )}
      {activeTranscript ? <ConversationMessage message={activeTranscript} /> : null}
    </div>
  )
}
