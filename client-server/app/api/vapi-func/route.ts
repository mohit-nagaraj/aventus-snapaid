import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { function_call } = body;

  switch (function_call.name) {
    case 'raiseCase':
      const { symptom, duration } = function_call.arguments;
      const caseId = await createCase(symptom, duration);
      return new NextResponse(
        JSON.stringify({
          result: { message: `Case raised successfully with ID: ${caseId}` },
        }),
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    default:
      return new NextResponse(JSON.stringify({ error: 'Unknown function' }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
  }
}

// Mock function
async function createCase(symptom: string, duration: string) {
  console.log('Creating case with symptom:', symptom, 'and duration:', duration);
  return 'CASE123456';
}
