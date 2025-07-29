'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const projectTypes = [
  {
    value: 'General',
    label: 'General',
    description: 'Create project that includes pages, plugins, and themes.',
  },
  {
    value: 'Page Content',
    label: 'Page Content',
    description: 'Generate content for WordPress pages.',
  },
  {
    value: 'Plugin',
    label: 'Plugin',
    description: 'Develop custom WordPress plugins.',
  },
  {
    value: 'Theme',
    label: 'Theme',
    description: 'Create custom WordPress themes.',
  },
];

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Page Content');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      console.log('Starting project creation...');

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log('Auth check:', { user, authError });

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user) {
        throw new Error('Please sign in to create a project');
      }

      // Get customer
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email);

      if (customerError) {
        console.error('Customer fetch error:', customerError);
        throw new Error(`Error fetching customer: ${customerError.message}`);
      }

      // Create customer if not exists
      let customerId;
      if (!customers || customers.length === 0) {
        try {
          console.log('Creating new customer for user:', user.email);
          // First try to upsert the customer
          const { data: newCustomer, error: upsertError } = await supabase
            .from('customers')
            .upsert([
              {
                email: user.email,
                customer_id: user.id, // Use user's ID as customer_id
              },
            ])
            .select('customer_id')
            .single();

          console.log('Customer upsert response:', { newCustomer, upsertError });

          if (upsertError) {
            console.error('Customer upsert error:', upsertError);
            // If upsert fails, try to get the customer again
            const { data: existingCustomer } = await supabase
              .from('customers')
              .select('customer_id')
              .eq('email', user.email)
              .single();

            if (existingCustomer) {
              customerId = existingCustomer.customer_id;
            } else {
              throw new Error(`Error creating customer: ${upsertError.message}`);
            }
          } else if (!newCustomer) {
            throw new Error('Failed to create customer: No data returned');
          } else {
            customerId = newCustomer.customer_id;
          }
        } catch (error) {
          console.error('Error in customer creation:', error);
          throw new Error('Failed to create customer account. Please try again.');
        }
      } else {
        customerId = customers[0].customer_id;
      }

      console.log('Using customer ID:', customerId);

      // Create project (no limit)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name: projectName,
            type: projectType,
            customer_id: customerId,
          },
        ])
        .select()
        .single();

      console.log('Project creation:', { project, projectError });

      if (projectError) {
        console.error('Project error details:', projectError);
        throw new Error(`Error creating project: ${projectError.message}`);
      }

      if (!project) {
        throw new Error('Failed to create project: No data returned');
      }

      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });
      setOpen(false);
      router.push(`/app/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>New Project</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Enter a name and select a type for your new project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label>Project Type</Label>
              <RadioGroup value={projectType} onValueChange={setProjectType} className="grid gap-4">
                {projectTypes.map((type) => (
                  <Label
                    key={type.value}
                    htmlFor={type.value}
                    className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer"
                  >
                    <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {type.label}
                      </span>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProject} disabled={!projectName || loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
