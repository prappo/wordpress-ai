import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

async function deleteFolder(supabase: SupabaseClient, bucket: string, folderPath: string) {
  // List all items in the folder
  const { data: items, error: listError } = await supabase.storage.from(bucket).list(folderPath);

  if (listError) {
    console.error('Error listing items:', listError);
    throw listError;
  }

  if (!items || items.length === 0) {
    return;
  }

  // Process each item
  for (const item of items) {
    const itemPath = `${folderPath}/${item.name}`;

    if (item.metadata?.mimetype === 'folder') {
      // Recursively delete subfolders
      await deleteFolder(supabase, bucket, itemPath);
    }
  }

  // Get all files in the current folder
  const { data: files } = await supabase.storage.from(bucket).list(folderPath);

  if (files && files.length > 0) {
    const filePaths = files.map((file: { name: string }) => `${folderPath}/${file.name}`);
    const { error: deleteError } = await supabase.storage.from(bucket).remove(filePaths);

    if (deleteError) {
      console.error('Error deleting files:', deleteError);
      throw deleteError;
    }
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, projectId } = await request.json();

    if (!customerId || !projectId) {
      return NextResponse.json({ error: 'Customer ID and Project ID are required' }, { status: 400 });
    }

    // Create Supabase admin client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const folderPath = `${customerId}/${projectId}`;

    try {
      // Recursively delete the folder and all its contents
      await deleteFolder(supabase, 'projects', folderPath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting folder:', error);
      return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in delete-file route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
