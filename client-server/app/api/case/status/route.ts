import { supaclient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { case_id, status } = body;
        
        if (!case_id || !status) {
            return NextResponse.json({ error: 'case_id and status are required' }, { status: 400 });
        }

        // Validate status
        const validStatuses = ['Opened', 'Triaged', 'Verified', 'Treating', 'Resolved', 'needsinfo'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        const { data, error } = await supaclient
            .from('cases')
            .update({ status })
            .eq('id', case_id)
            .select();
        
        if (error) {
            console.error('Error updating case status:', error);
            return NextResponse.json({ error: 'Failed to update case status' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Case status updated successfully', data });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}