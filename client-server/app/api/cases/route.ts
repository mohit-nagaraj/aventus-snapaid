import { supaclient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Received data:', body);

        const {
            user_id,
            input_text,
            input_image,
            input_voice
        } = body;

        const { data, error } = await supaclient
            .from('cases')
            .insert({
                user_id,
                input_text,
                input_image,
                input_voice,
                conversation_history: [],
            })
            .select()
            .single();

        const fastapiResponse = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id,
                input_text,
                input_image,
                input_voice,
                conversation_history: [],
            }),
        });

        console.log('FastAPI response:', fastapiResponse.status);

        if (error) console.error('Webhook error:', error)


        return NextResponse.json({ message: 'successfull', data: data }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userid');
    try {
        if(userId) {
        console.log('Fetching cases for userId:', userId);
        const { data, error } = await supaclient
            .from('cases')
            .select('*')
            .eq("user_id", userId)

        if (error) {
            console.error('Error fetching cases:', error);
            return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
        }

        return NextResponse.json({data}, { status: 200 });
        } else {
            console.log('Fetching all cases');
            const { data, error } = await supaclient
                .from('cases')
                .select('*')

            if (error) {
                console.error('Error fetching cases:', error);
                return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
            }

            return NextResponse.json({data}, { status: 200 });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}


// export async function GET(request: NextRequest) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const user_id = searchParams.get('user_id');

//         if (!user_id) {
//             return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
//         }

//         const { data, error } = await supaclient
//             .from('cases')
//             .select('*')
//             .eq('user_id', user_id);

//         if (error) {
//             console.error('Error fetching cases:', error);
//             return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
//         }

//         return NextResponse.json(data, { status: 200 });
//     } catch (error) {
//         console.error('Error processing request:', error);
//         return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
//     }
// }
