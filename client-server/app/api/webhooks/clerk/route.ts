import { supaclient } from '@/lib/supabase'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {

    try {
        const evt = await verifyWebhook(req)

        const eventType = evt.type
        console.log('Webhook payload:', evt.data)

        if (eventType === 'user.created') {
            console.log('User:', evt.data)
            const { id, first_name, has_image, image_url, last_name, username } = evt.data
            const email = evt.data.email_addresses[0].email_address

            const { error } = await supaclient
                .from('profiles')
                .insert({
                    user_id: id,
                    name: `${first_name} ${last_name}`,
                    gender: null,
                    role: 'patient',
                    email,
                    image: has_image ? image_url : null,
                    username,
                })

            if (error) console.error('Webhook error:', error)
        } else if (eventType === 'user.updated') {
            console.log('User updated:', evt.data)
            const { id, first_name, has_image, image_url, last_name, username } = evt.data
            const role = evt.data?.public_metadata?.role || 'patient'

            const { error } = await supaclient
                .from('profiles')
                .update({
                    name: `${first_name} ${last_name}`,
                    image: has_image ? image_url : null,
                    username,
                    role,
                })
                .eq('user_id', id)

            if (error) console.error('Update error:', error)
        }

        return new Response('OK', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}