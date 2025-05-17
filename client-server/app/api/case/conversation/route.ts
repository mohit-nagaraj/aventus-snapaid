import { supaclient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json(); 
        console.log('Request Body:', body);
        const {conversation_history, case_id} = body;
        if (!conversation_history || !case_id) {
            return NextResponse.json({ error: 'conversation_history and case_id are required' }, { status: 400 });
        }
        // plox send the entire array of conversation history here else gone gg
        const { data, error } = await supaclient
            .from('cases')
            .update({ conversation_history })
            .eq('id', case_id)
            .select();
        
        if (error) {
            return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Chat updated successfully', data });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}