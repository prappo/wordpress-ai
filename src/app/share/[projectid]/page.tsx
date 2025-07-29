"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import WordPressPlayground from "@/components/wordpress-playground";
import { WordPressGeneratorProvider } from "@/lib/wordpress-generator-context";
import { DebugConsoleProvider } from "@/lib/debug-console-context";

interface ProjectData {
  id: string;
  name: string;
  content_url?: string;
  created_at: string;
  updated_at: string;
}

export default function SharePage() {
  const { projectid } = useParams<{ projectid: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProject() {
      try {
        const { data: projectData, error } = await supabase
          .from("projects")
          .select("id, name, content_url, created_at, updated_at")
          .eq("id", projectid)
          .single();

        if (error) {
          console.error("Error loading project:", error);
          return;
        }

        setProject(projectData);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectid, supabase]);

  if (loading) {
    return <div className="w-full h-screen bg-background" />;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <p className="text-muted-foreground">
            The project you are looking for does not exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WordPressGeneratorProvider>
      <DebugConsoleProvider>
        <div className="w-full h-screen">
          <WordPressPlayground content_url={project.content_url} />
        </div>
      </DebugConsoleProvider>
    </WordPressGeneratorProvider>
  );
}
