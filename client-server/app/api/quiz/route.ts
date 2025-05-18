import { type NextRequest, NextResponse } from "next/server"


const FASTAPI_URL = `${process.env.FASTAPI_URL || "http://localhost:8000"}/quiz`;


export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate the request body
    if (!body.quizType || !body.responses || !Array.isArray(body.responses)) {
      return NextResponse.json(
        { error: "Invalid request body. Must include quizType and responses array." },
        { status: 400 },
      )
    }

    // Format the data for the FastAPI backend
    const formattedData = {
      quiz_type: body.quizType,
      responses: body.responses,
      user_id: body.userId || "anonymous", // Optional user ID if authentication is implemented
      timestamp: new Date().toISOString(),
      metadata: body.metadata || {}, // Any additional metadata
    }

    // Send the data to the FastAPI backend
    const response = await fetch(FASTAPI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers if needed
        // "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify(formattedData),
    })

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("Error from FastAPI:", errorData)
      return NextResponse.json(
        { error: "Failed to process quiz results", details: errorData },
        { status: response.status },
      )
    }

    // Return the response from the FastAPI backend
    const data = await response.json()
    console.log("Quiz results processed successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing quiz results:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
