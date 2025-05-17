"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

import { useVapi, vapi, VapiButton } from "../components/Assistant"
import { MessageList } from "../components/Messages/MessageList"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Mic, Info, HeartPulse, Stethoscope, Brain } from "lucide-react"
import { ScrollArea } from "../components/ui/ScrollArea"

export default function ChatPage() {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const [showWelcome, setShowWelcome] = useState(true)

  const scrollToBottom = () => {
    const viewport = viewportRef.current
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }

  const { toggleCall, messages, callStatus, activeTranscript, audioLevel } = useVapi()

  useEffect(() => {
    vapi.on("message", () => {
      scrollToBottom()
      if (messages.length > 0 || activeTranscript) {
        setShowWelcome(false)
      }
    })

    if (messages.length > 0 || activeTranscript) {
      setShowWelcome(false)
    }

    return () => {
      vapi.off("message", scrollToBottom)
    }
  }, [messages, activeTranscript])

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 py-6 flex flex-col h-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-800">AI Health Assistant</h1>
          </div>
          <p className="text-slate-600">Get instant AI-powered health guidance and triage support</p>
        </div>

        <Card className="flex-grow flex flex-col relative overflow-hidden border-purple-100 shadow-sm">
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
            {showWelcome ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartPulse className="h-10 w-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to SnapAid Chat</h2>
                  <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Describe your symptoms or health concerns, and our AI will provide initial guidance and triage
                    recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                  <Card className="p-4 border-purple-100 bg-white">
                    <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <Mic className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Voice Enabled</h3>
                    <p className="text-sm text-slate-600">Speak naturally about your symptoms using the microphone</p>
                  </Card>

                  <Card className="p-4 border-purple-100 bg-white">
                    <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">AI Assessment</h3>
                    <p className="text-sm text-slate-600">Get instant analysis of your health concerns</p>
                  </Card>

                  <Card className="p-4 border-purple-100 bg-white">
                    <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <Stethoscope className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Professional Care</h3>
                    <p className="text-sm text-slate-600">Cases are reviewed by healthcare professionals</p>
                  </Card>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => toggleCall && toggleCall()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    Start Speaking
                    <Mic className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">Press the button and describe your symptoms</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col min-h-[70vh] justify-end pb-16">
                <MessageList messages={messages} activeTranscript={activeTranscript} />
              </div>
            )}
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-white border-t border-purple-100 flex justify-between items-center">
            <div className="text-sm text-slate-500 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              <span>Your conversation is private and secure</span>
            </div>
            <EnhancedVapiButton audioLevel={audioLevel} callStatus={callStatus} toggleCall={toggleCall} />
          </div>
        </Card>
      </div>
    </main>
  )
}

const EnhancedVapiButton = ({ toggleCall, callStatus, audioLevel = 0 }: Partial<ReturnType<typeof useVapi>>) => {
  return (
    <div className="flex flex-col items-center">
      <VapiButton audioLevel={audioLevel} callStatus={callStatus} toggleCall={toggleCall} />
      <span className="text-xs text-slate-500 mt-2">{callStatus === "active" ? "Tap to stop" : "Tap to speak"}</span>
    </div>
  )
}
