"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Spinner } from "@/components/spinner"
import ReactMarkdown from "react-markdown"

const quizData = {
  skin: {
    title: "Skin Health Assessment",
    questions: [
      {
        id: 1,
        question: "How would you describe your skin type?",
        options: ["Dry", "Oily", "Combination", "Normal", "Sensitive"],
      },
      {
        id: 2,
        question: "Do you experience frequent breakouts?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Very frequently"],
      },
      {
        id: 3,
        question: "How often do you wear sunscreen?",
        options: ["Daily", "Often", "Sometimes", "Rarely", "Never"],
      },
    ],
  },
  hair: {
    title: "Hair Health Assessment",
    questions: [
      {
        id: 1,
        question: "How would you describe your hair type?",
        options: ["Straight", "Wavy", "Curly", "Coily", "Mixed"],
      },
      {
        id: 2,
        question: "Do you experience hair loss or thinning?",
        options: ["Not at all", "Slightly", "Moderately", "Significantly", "Severely"],
      },
      {
        id: 3,
        question: "How often do you use heat styling tools?",
        options: ["Never", "Rarely", "Sometimes", "Often", "Daily"],
      },
    ],
  },
  diabetes: {
    title: "Diabetes Risk Assessment",
    questions: [
      {
        id: 1,
        question: "Do you have a family history of diabetes?",
        options: ["No", "Yes, distant relatives", "Yes, immediate family"],
      },
      {
        id: 2,
        question: "How would you describe your physical activity level?",
        options: ["Very active", "Moderately active", "Somewhat active", "Not very active", "Sedentary"],
      },
      {
        id: 3,
        question: "How often do you consume sugary foods or beverages?",
        options: ["Rarely or never", "1-2 times a week", "3-4 times a week", "Almost daily", "Multiple times daily"],
      },
    ],
  },
  depression: {
    title: "Mental Health Assessment",
    questions: [
      {
        id: 1,
        question: "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      },
      {
        id: 2,
        question: "How often do you have little interest or pleasure in doing things?",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      },
      {
        id: 3,
        question: "How would you rate your sleep quality over the past month?",
        options: ["Very good", "Good", "Fair", "Poor", "Very poor"],
      },
    ],
  },
  chronic: {
    title: "Chronic Conditions Assessment",
    questions: [
      {
        id: 1,
        question: "Do you experience persistent pain in any part of your body?",
        options: ["No", "Yes, occasionally", "Yes, frequently", "Yes, constantly"],
      },
      {
        id: 2,
        question: "Do you have any diagnosed chronic conditions?",
        options: ["None", "One condition", "Two conditions", "Three or more conditions"],
      },
      {
        id: 3,
        question: "How would you rate your overall energy levels?",
        options: ["Excellent", "Good", "Fair", "Poor", "Very poor"],
      },
    ],
  },
}

type QuizParams = {
  params: {
    type: string
  }
}

export default function QuizPage({ params }: QuizParams) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const quizType = params.type
  const quiz = quizData[quizType as keyof typeof quizData]

  useEffect(() => {
    if (!quiz) router.push("/")
  }, [quiz, router])

  useEffect(() => {
    if (answers[currentQuestion]) {
      setSelectedOption(answers[currentQuestion])
    } else {
      setSelectedOption(null)
    }
  }, [currentQuestion, answers])

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
  }

  const handleContinue = () => {
    if (!selectedOption) return
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestion] = selectedOption
    setAnswers(updatedAnswers)

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizComplete(true)
      submitQuizResults(updatedAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestion === 0) {
      router.push("/")
    } else {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuizResults = async (finalAnswers: string[]) => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const formattedResponses = quiz.questions.map((q, i) => ({
        question_id: q.id,
        question_text: q.question,
        answer: finalAnswers[i],
      }))

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizType: quizType,
          responses: formattedResponses,
          metadata: {
            quizTitle: quiz.title,
            completedAt: new Date().toISOString(),
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Submission failed")
      }

      const result = await res.json()
      console.log(result)
      setSubmissionResult(result)
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (!quiz) return null

  if (quizComplete) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {isSubmitting ? (
              <div className="flex flex-col items-center py-8">
                <Spinner className="mb-4" />
                <p>Submitting your responses...</p>
              </div>
            ) : submissionError ? (
              <div className="text-red-500 py-6">
                <p>Error: {submissionError}</p>
                <Button onClick={() => submitQuizResults(answers)} className="mt-4">Try Again</Button>
              </div>
            ) : submissionResult ? (
              <div className="space-y-6 py-6 text-left">
                <p className="text-center font-semibold text-purple-600">Thank you for completing the {quiz.title}.</p>
                <div className="bg-purple-100/10 p-6 rounded-lg">
                  <div className="space-y-4">
                    <ReactMarkdown>{submissionResult}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-6">Thank you for completing the quiz.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")}>Return to Quizzes</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center">{quiz.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <div
                key={i}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === option ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedOption} className="flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
