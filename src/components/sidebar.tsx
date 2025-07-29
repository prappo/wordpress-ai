'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
// import { useWordPressGenerator } from "@/lib/wordpress-generator-context"
import { useToast } from '@/components/ui/use-toast';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import JSZip from 'jszip';
import { zipWpContent } from '@wp-playground/client';

interface Message {
  role: string;
  content: string;
}

interface WordPressFile {
  path: string;
  code: string;
}

interface ProjectData {
  name: string;
  customer_id: string;
  updated_at: string;
  messages?: Message[];
  code?: WordPressFile[];
  content_url?: string;
}

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { toast } = useToast();
  // const { projects } = useWordPressGenerator()
  const runtime = useChatRuntime({ api: '/api/chat' });
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Get the current project ID from the URL
      const pathname = window.location.pathname;
      const projectId = pathname.split('/').pop();

      if (!projectId) {
        toast({
          title: 'No project selected',
          description: 'Please select a project first',
          variant: 'destructive',
        });
        return;
      }

      // Get the current user's ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw new Error(`Failed to get user: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get existing customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email)
        .single();

      if (customerError) {
        console.error('Error checking customer:', customerError);
        throw new Error(`Failed to check customer: ${customerError.message}`);
      }

      if (!customer) {
        throw new Error('No customer account found. Please contact support.');
      }

      // Get project details from Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error getting project:', projectError);
        throw new Error(`Failed to get project: ${projectError.message}`);
      }

      if (!projectData) {
        toast({
          title: 'Project not found',
          description: 'The project could not be found in the database',
          variant: 'destructive',
        });
        return;
      }

      // Get the current thread messages
      const messages = runtime.messages;

      // --- Replace old zip logic with logic from browser-mockup ---
      let zipBlob: Blob;
      const currentProjectFiles: WordPressFile[] = []; // Initialize for fallback/metadata saving

      if (window.client) {
        // Check if Playground client is available
        try {
          console.log('Save: Starting wp-content zip process from Playground...');
          const zipContent = await zipWpContent(window.client);
          console.log(`Save: Original zip size: ${zipContent.byteLength} bytes`);

          const newZip = new JSZip();
          const originalZip = await JSZip.loadAsync(zipContent);
          console.log('Save: Original zip loaded. Files:', Object.keys(originalZip.files));

          const filePromises: Promise<void>[] = [];
          let filesAddedCount = 0;

          originalZip.forEach((relativePath, zipEntry) => {
            // console.log(`Save: Processing entry: ${relativePath}, isDir: ${zipEntry.dir}`); // Optional logging
            if (!zipEntry.dir && relativePath.startsWith('wp-content/')) {
              // console.log(`Save: Adding file: ${relativePath}`); // Optional logging
              filesAddedCount++;
              filePromises.push(
                zipEntry.async('uint8array').then((content) => {
                  newZip.file(relativePath, content);
                  // Also capture file info for saving metadata, ONLY if it's valid text
                  try {
                    const decodedCode = new TextDecoder('utf-8', { fatal: true }).decode(content); // Use fatal: true
                    // Check for null characters explicitly, though fatal:true should throw for invalid UTF-8 sequences
                    if (!decodedCode.includes('\u0000')) {
                      currentProjectFiles.push({ path: relativePath, code: decodedCode });
                    } else {
                      console.warn(`Skipping metadata for ${relativePath}: contains null characters.`);
                    }
                  } catch (decodeError) {
                    // If TextDecoder fails (e.g., invalid UTF-8 sequence), it's likely not text.
                    console.warn(`Skipping metadata for ${relativePath}: Not valid UTF-8 text.`, decodeError);
                  }
                }),
              );
            }
          });

          console.log(`Save: Waiting for ${filePromises.length} file promises...`);
          await Promise.all(filePromises);
          console.log(`Save: All file promises resolved. Total files added attempt: ${filesAddedCount}`);

          const newZipContent = await newZip.generateAsync({ type: 'uint8array' });
          console.log(`Save: Generated new zip size: ${newZipContent.length} bytes`);

          if (newZipContent.length === 0) {
            console.warn('Save: Generated wp-content zip is empty.');
            throw new Error('Cannot save project: No wp-content files found in Playground.');
          }

          zipBlob = new Blob([newZipContent], { type: 'application/zip' });
        } catch (zipError) {
          console.error('Error creating zip from Playground:', zipError);
          toast({
            title: 'Error preparing project files',
            description: `Could not generate zip from Playground: ${zipError instanceof Error ? zipError.message : String(zipError)}`,
            variant: 'destructive',
          });
          return; // Stop saving process
        }
      } else {
        // Fallback or error if window.client is not available?
        // For now, let's throw an error as saving requires the live state.
        console.error('Save: window.client not found.');
        throw new Error('Playground client is not available to save the current state.');
      }
      // --- End of replaced zip logic ---

      // Upload the zip file with project ID as name
      const formData = new FormData();
      formData.append('file', zipBlob, `${projectId}.zip`);
      formData.append('customerId', customer.customer_id);
      formData.append('projectId', projectId);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Failed to upload project: ${errorText}`);
      }

      const { url: contentUrl } = await uploadResponse.json();

      // Prepare the data to save
      const dataToSave: ProjectData = {
        name: projectData.name,
        customer_id: customer.customer_id,
        updated_at: new Date().toISOString(),
        messages: messages,
        code: currentProjectFiles,
        content_url: contentUrl,
      };

      // Update the project with new content_url
      const { error } = await supabase.from('projects').update(dataToSave).eq('id', projectId);

      if (error) {
        // If the error is about missing columns, try again without the optional fields
        if (error.code === 'PGRST204') {
          const { error: retryError } = await supabase
            .from('projects')
            .update({
              name: projectData.name,
              customer_id: customer.customer_id,
              updated_at: new Date().toISOString(),
              content_url: contentUrl, // Ensure content_url is always updated
            })
            .eq('id', projectId);

          if (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }

      toast({
        title: 'Project saved',
        description: 'Your project has been saved successfully',
      });
    } catch (error) {
      console.error('Error saving project:', error);
      let errorMessage = 'An unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('code' in error && 'message' in error) {
          errorMessage = `${error.message} (Code: ${error.code})`;
          if ('details' in error) {
            errorMessage += `\nDetails: ${error.details}`;
          }
        }
      }

      toast({
        title: 'Error saving project',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn('w-14 border-r border-border/50 bg-[#0C0F0F] flex flex-col', className)} {...props}>
      <div className="flex h-14 items-center justify-center border-b border-border/50">
        <Link href="/dashboard/projects" className="p-0">
          <Image src={'/assets/icons/logo.png'} alt={'WordPress AI'} width={90} height={90} />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center py-4 gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 cursor-pointer w-10 rounded-lg  flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          title="Save Project"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* <Save
              className={`h-5 w-5 text-primary transition-opacity duration-200 ${isSaving ? 'opacity-0' : 'opacity-100'}`}
            /> */}
            <Image src={'/assets/icons/save.png'} className={`${isSaving ? 'opacity-0' : 'opacity-100'}`} alt={'Save'} width={40} height={40} />
            <LoaderIcon
              className={`h-5 w-5 text-primary absolute animate-spin [animation-duration:1.5s] transition-opacity duration-200 ${isSaving ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        </button>
        {/* <div className="border-t border-border/50 p-2"></div> */}
      </div>
    </div>
  );
}
