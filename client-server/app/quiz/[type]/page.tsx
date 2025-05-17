"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"

// Quiz data for each type
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

export default function QuizPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [quizComplete, setQuizComplete] = useState(false)

  const quizType = params.type
  const quiz = quizData[quizType as keyof typeof quizData]

  // Redirect if invalid quiz type
  useEffect(() => {
    if (!quiz) {
      router.push("/")
    }
  }, [quiz, router])

  if (!quiz) {
    return null
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
  }

  const handleContinue = () => {
    if (selectedOption) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedOption

      setAnswers(newAnswers)

      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        setQuizComplete(true)
      }
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedOption(answers[currentQuestion - 1] || null)
    } else {
      router.push("/")
    }
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (quizComplete) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Thank you for completing the {quiz.title}.</p>
            <p className="mb-6">
              Based on your responses, we would prepare personalized recommendations for your health needs.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
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
        <h1 className="text-2xl font-bold text-center mb-2">{quiz.title}</h1>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
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
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedOption} className="flex items-center gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
