import { supaclient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received vapi data:', body);
    const { message } = body;
    console.log("message", message)
    const function_call = message.toolCalls[0].function
    console.log("function_call", function_call)
    switch (function_call?.name) {
      case 'raiseCase': {
        const { symptom, duration } = function_call.arguments;
        const caseId = await createCase(symptom, duration);

        return new NextResponse(
          JSON.stringify({ result: { message: `Case raised successfully with ID: ${caseId}` } }),
          {
            status: 200,
            headers: CORS_HEADERS,
          }
        );
      }

      case 'getUserCases': {
        const cases = await getUserCases("user_2wZbsW6bPlUMdpl88fNHlWphguY");
        return new NextResponse(
          JSON.stringify({
            cases: cases
          }),
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      default:
        return new NextResponse(JSON.stringify({ error: 'Unknown function' }), {
          status: 400,
          headers: CORS_HEADERS,
        });
    }
  } catch (err) {
    console.error('POST error:', err);
    return new NextResponse(JSON.stringify({ error: 'Invalid request body or server error' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

async function createCase(symptom: string, duration: string): Promise<string | null> {
  const { userId } = await auth();
  const inputText = `I have been feeling ${symptom} for ${duration}.`;
  let newuserId = userId;
  if (!newuserId) {
    newuserId = "user_2wZbsW6bPlUMdpl88fNHlWphguY"
  }

  try {
    const { data, error } = await supaclient
      .from('cases')
      .insert({ user_id: newuserId, input_text: inputText })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return null;
    }

    const { id: caseId } = data;
    console.log("CaseId",caseId)

    try{
      const fastapiRes = await fetch(`https://q1xxcnb9-8000.inc1.devtunnels.ms/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: inputText }),
      });
  
      if (!fastapiRes.ok) throw new Error('FastAPI response failed');
  
      const fastapiData = await fastapiRes.json();
      console.log('FastAPI response:', fastapiData);
  
      const triageRes = await fetch(`http://localhost:3000/api/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labels: fastapiData.label,
          summary: fastapiData.summary,
          recommended_action: fastapiData.recommended_action,
          risk_score: fastapiData.risk_score,
          case_id: caseId,
        }),
      });
  
      if (!triageRes.ok) console.warn('Triage POST failed');
  
      return caseId;
    }catch(e:any){
      console.log("err3",e)
      return null;
    }

    
  } catch (err) {
    console.error('createCase error:', err);
    return null;
  }
}

async function getUserCases(userId: string) {

  const { data, error } = await supaclient
    .from('cases')
    .select(`*,
                triage_results (
                    id,
                    labels,
                    summary,
                    recommended_action
                )`)
    .eq("user_id", userId)

  if (error) {
    console.error('Error fetching cases:', error);
    return 'Failed to fetch cases';
  }

  return data;

}
