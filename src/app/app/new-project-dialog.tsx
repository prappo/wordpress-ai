"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      console.log("Starting project creation...");
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Auth check:", { user, authError });
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error("Please sign in to create a project");
      }

      // Get customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("customer_id")
        .eq("email", user.email)
        .single();
      
      console.log("Customer fetch:", { customer, customerError });

      if (customerError) {
        throw new Error(`Error fetching customer: ${customerError.message}`);
      }

      if (!customer) {
        throw new Error("No customer account found. Please contact support.");
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: projectName,
            customer_id: customer.customer_id,
          },
        ])
        .select()
        .single();

      console.log("Project creation:", { project, projectError });

      if (projectError) {
        console.error("Project error details:", projectError);
        throw new Error(`Error creating project: ${projectError.message}`);
      }

      if (!project) {
        throw new Error("Failed to create project: No data returned");
      }

      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      setOpen(false);
      router.push(`/app/${project.id}`);
    } catch (error) {
      console.error("Detailed error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter a name for your new project. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="name"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateProject}
            disabled={!projectName || loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 