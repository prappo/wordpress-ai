"use client";

import { NewProjectDialog } from "../../../components/dashboard/projects/new-project-dialog";
import { DeleteProjectDialog } from "../../../components/dashboard/projects/delete-project-dialog";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from "@/components/dashboard/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Calendar, ArrowUpRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Brief initial loading to ensure smooth page transitions
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    async function loadProjects() {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const { data: customers, error: customerError } = await supabase
          .from("customers")
          .select("customer_id")
          .eq("email", user.email);

        if (customerError) {
          console.error("Error fetching customer:", customerError);
          setError("Failed to load user data");
          setLoading(false);
          return;
        }

        if (!customers || customers.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("customer_id", customers[0].customer_id)
          .order("created_at", { ascending: false });

        if (projectsError) {
          console.error("Error loading projects:", projectsError);
          setError("Failed to load projects");
          setLoading(false);
          return;
        }

        if (projects) {
          setProjects(projects);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [supabase, initialLoading]);

  if (initialLoading || loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
        <DashboardPageHeader pageTitle="Projects" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
        <DashboardPageHeader pageTitle="Projects" />
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Failed to load projects</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {error}
          </p>
          <Button 
            onClick={() => {
              setLoading(true);
              setError(null);
              // Reload projects
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
      <DashboardPageHeader pageTitle="Projects" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {projects.length === 0 ? "No projects yet" : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
          </h2>
          <p className="text-muted-foreground mt-1">
            {projects.length === 0 
              ? "Create your first project to get started" 
              : "Manage and organize your projects"
            }
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first project to start building and organizing your work.
          </p>
          <NewProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:shadow-lg hover:shadow-border/20 transition-all duration-200 cursor-pointer"
              onClick={() => {
                try {
                  window.open(`/app/${project.id}`, '_blank');
                } catch (error) {
                  console.error('Error opening project:', error);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
              
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>
      )}

      {selectedProject && (
        <DeleteProjectDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onDelete={() => {
            setProjects(projects.filter(p => p.id !== selectedProject.id));
            setSelectedProject(null);
          }}
        />
      )}
    </main>
  );
} 