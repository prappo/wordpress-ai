"use client";

import { Folder, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectUsage {
  currentProjects: number;
  projectLimit: number;
  remainingProjects: number;
}

export function DashboardUsageCardGroup() {
  const [projectUsage, setProjectUsage] = useState<ProjectUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProjectUsage() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setProjectUsage({
            currentProjects: 0,
            projectLimit: Infinity,
            remainingProjects: Infinity,
          });
          setLoading(false);
          return;
        }

        // Get customer ID
        const { data: customers, error: customerError } = await supabase
          .from("customers")
          .select("customer_id")
          .eq("email", user.email);

        if (customerError || !customers || customers.length === 0) {
          setProjectUsage({
            currentProjects: 0,
            projectLimit: Infinity,
            remainingProjects: Infinity,
          });
          setLoading(false);
          return;
        }

        // Get project count
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id", { count: "exact" })
          .eq("customer_id", customers[0].customer_id);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          setProjectUsage({
            currentProjects: 0,
            projectLimit: Infinity,
            remainingProjects: Infinity,
          });
          setLoading(false);
          return;
        }

        const currentProjects = projects?.length || 0;

        setProjectUsage({
          currentProjects,
          projectLimit: Infinity,
          remainingProjects: Infinity,
        });
      } catch (error) {
        console.error("Error getting project usage:", error);
        setProjectUsage({
          currentProjects: 0,
          projectLimit: Infinity,
          remainingProjects: Infinity,
        });
      } finally {
        setLoading(false);
      }
    }

    loadProjectUsage();
  }, [supabase]);

  if (loading) {
    return (
      <div className={'grid gap-6'}>
        <Card className={'bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-colors'}>
          <CardHeader className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Folder className={'text-primary'} size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Manage your WordPress projects
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={'grid gap-6'}>
      <Card className={'bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-colors'}>
        <CardHeader className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Folder className={'text-primary'} size={20} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Projects</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Manage your WordPress projects
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-foreground">
                {projectUsage?.currentProjects || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {(projectUsage?.currentProjects || 0) === 1 ? 'Project created' : 'Projects created'}
              </div>
            </div>
            <Link href="/dashboard/projects">
              <Button size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            Create unlimited projects to organize your WordPress development work
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
