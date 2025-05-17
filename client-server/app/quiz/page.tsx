import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Droplets, Sun, Activity, Pill } from "lucide-react"

export default function Quiz() {
  const quizTypes = [
    {
      id: "skin",
      title: "Skin Health Quiz",
      description: "Assess your skin health and get personalized recommendations",
      icon: <Sun className="h-8 w-8 text-orange-500" />,
    },
    {
      id: "hair",
      title: "Hair Health Quiz",
      description: "Discover solutions for your hair concerns",
      icon: <Droplets className="h-8 w-8 text-blue-500" />,
    },
    {
      id: "diabetes",
      title: "Diabetes Risk Assessment",
      description: "Evaluate your risk factors for diabetes",
      icon: <Activity className="h-8 w-8 text-red-500" />,
    },
    {
      id: "depression",
      title: "Mental Health Check",
      description: "Assess your emotional wellbeing",
      icon: <Brain className="h-8 w-8 text-purple-500" />,
    },
    {
      id: "chronic",
      title: "Chronic Conditions",
      description: "Identify potential chronic health concerns",
      icon: <Pill className="h-8 w-8 text-green-500" />,
    },
  ]

  return (
    <main className="container mx-auto py-12 px-4">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Take a Health Quiz</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover insights about your health with our specialized assessments. Each quiz takes just a few minutes to
          complete.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizTypes.map((quiz) => (
          <Link href={`/quiz/${quiz.id}`} key={quiz.id} className="transition-transform hover:scale-105">
            <Card className="h-full border-2 hover:border-purple-600">
              <CardHeader>
                <div className="mb-4 flex justify-center">{quiz.icon}</div>
                <CardTitle className="text-xl text-center">{quiz.title}</CardTitle>
                <CardDescription className="text-center">{quiz.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pb-6">
                <div className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-primary-foreground">
                  Start Quiz
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
