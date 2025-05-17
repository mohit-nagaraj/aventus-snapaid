import { supaclient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const timestamp = Date.now();
    const originalFilename = file.name;
    const safeName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${safeName}`;
    
    const { error } = await supaclient.storage
      .from('snapaid-storage')
      .upload(`${folder}/${filename}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading file:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const fileUrl = supaclient.storage
      .from('snapaid-storage')
      .getPublicUrl(`${folder}/${filename}`).data.publicUrl;

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}