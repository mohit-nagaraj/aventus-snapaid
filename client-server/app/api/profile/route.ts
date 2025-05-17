import { supaclient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userid');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {

        const { data, error } = await supaclient
            .from('profiles')
            .select('*')
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { user_id, name, age, gender } = await request.json();

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required in payload' }, { status: 400 });
        }

        const { data, error } = await supaclient
            .from('profiles')
            .update({ name, age, gender })
            .eq('user_id', user_id)
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
