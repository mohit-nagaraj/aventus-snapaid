import { supaclient } from '@/lib/supabase';
import { hasEmergencyLabel } from '@/utils/labelcheck';
import { sendEmergencyNotifications } from '@/utils/sendmail';
import { NextResponse } from 'next/server';

// create when case is created
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Request Body:', body);
        const { labels,summary,recommended_action, case_id } = body;
        if (!case_id) {
            return NextResponse.json({ error: 'case_id are required' }, { status: 400 });
        }

        const { error } = await supaclient
            .from('triage_results')
            .insert({
                case_id,
                labels,
                summary,
                recommended_action
            });

        if (error) {
            return NextResponse.json({ error: 'Failed to create triage' }, { status: 500 });
        }

        if (hasEmergencyLabel(labels)) {
            await sendEmergencyNotifications(case_id);
        }

        return NextResponse.json({ message: 'Triage created successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

// update when chat coversation is updated
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        console.log('Request Body:', body);
        const { labels, summary, recommended_action, case_id, risk_score } = body;

        if (!case_id) {
            return NextResponse.json({ error: 'labels and case_id are required' }, { status: 400 });
        }

        const { error } = await supaclient
            .from('triage_results')
            .update({
                labels,
                summary,
                recommended_action,
                risk_score
            })
            .eq('case_id', case_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to update triage' }, { status: 500 });
        }

        if (hasEmergencyLabel(labels)) {
            await sendEmergencyNotifications(case_id);
        }

        return NextResponse.json({ message: 'Triage updated successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

// get triage results for a case for client ui
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseid');

    if (!caseId) {
        return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    try {
        console.log('Fetching triage for caseId:', caseId);
        const { data, error } = await supaclient
            .from('triage_results')
            .select('*')
            .eq("case_id", caseId)
            .single();

        if (error) {
            console.error('Error fetching triage:', error);
            return NextResponse.json({ error: 'Failed to fetch triage' }, { status: 500 });
        }
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}