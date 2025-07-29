import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = 'projects';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !customerId || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if bucket exists, if not create it
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: bucketError } = await supabaseAdmin.storage
        .createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 1024 * 1024 * 50, // 50MB limit
        });

      if (bucketError && bucketError.message !== 'Bucket already exists') {
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    }

    // Create the folder path
    const folderPath = `${customerId}/${projectId}`;
    const filePath = `${folderPath}/wp-content.zip`;

    // Check if file exists and delete it
    const { data: existingFiles } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folderPath, {
        search: 'wp-content.zip'
      });

    if (existingFiles && existingFiles.length > 0) {
      // Delete existing file
      const { error: deleteError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // Upload the new file
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: 'application/zip',
        upsert: true
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 