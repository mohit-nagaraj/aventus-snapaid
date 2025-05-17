"use client"

import { CALL_STATUS, type useVapi } from "./useVapi"
import { Loader2, Mic, Square } from "lucide-react"

const VapiButton = ({ toggleCall, callStatus, audioLevel = 0 }: Partial<ReturnType<typeof useVapi>>) => {
  const buttonStyle = {
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    border: "none",
    color: "white",
    boxShadow: `0 0 ${10 + audioLevel * 40}px ${audioLevel * 10}px rgba(147, 51, 234, 0.6)`, // purple glow
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <button
      style={buttonStyle}
      className={`transition ease-in-out bg-purple-600 hover:bg-purple-700 flex items-center justify-center`}
      onClick={toggleCall}
    >
      {callStatus === CALL_STATUS.ACTIVE ? (
        <Square className="h-5 w-5" />
      ) : callStatus === CALL_STATUS.LOADING ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  )
}

export { VapiButton }
