import { supaclient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseid');

    if (!caseId) {
        return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    try {
        console.log('Fetching cases for caseId:', caseId);
        const { data, error } = await supaclient
            .from('cases')
            .select('*')
            .eq("id", caseId)
            .single();

        if (error) {
            console.error('Error fetching cases:', error);
            return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
        }
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}