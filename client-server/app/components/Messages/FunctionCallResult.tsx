import type { FunctionCallResultMessage } from "@/utils/types/conversation.type"
import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"

interface FunctionCallResultMessageProps {
  message: FunctionCallResultMessage
}

export default function FunctionCallResult({ message }: FunctionCallResultMessageProps) {
  return (
    <div className="flex w-full text-sm mb-4 justify-center">
      <Card className="p-4 rounded-xl bg-purple-50 text-purple-900 border-purple-200 max-w-[80%] shadow-sm">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <div className="p-1 bg-purple-100 rounded-full">
              <Info className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="leading-relaxed">{message.functionCallResult.result}</p>
        </div>
      </Card>
    </div>
  )
}
