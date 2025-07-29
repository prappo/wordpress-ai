'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  onDelete: () => void;
}

export function DeleteProjectDialog({ open, onOpenChange, projectId, projectName, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleDelete = async () => {
    try {
      setLoading(true);

      // First, get the project to check if it has a content_url
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('content_url, customer_id')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // If the project has a content_url, delete the associated file first
      if (project?.content_url) {
        try {
          const deleteResponse = await fetch('/api/delete-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: project.customer_id,
              projectId: projectId,
            }),
          });

          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(`Failed to delete file: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error in file deletion:', error);
          throw error; // Re-throw to prevent project deletion if file deletion fails
        }
      }

      // After successful file deletion (or if no file exists), delete the project from the database
      const { error: deleteError } = await supabase.from('projects').delete().eq('id', projectId);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      onOpenChange(false);
      onDelete();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{projectName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
