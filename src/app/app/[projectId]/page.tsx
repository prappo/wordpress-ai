'use client';
import { Thread } from '@/components/assistant-ui/thread';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import WordPressPlayground from '@/components/wordpress-playground';
import { WordPressGeneratorToolUI } from '@/components/tools/wordpress-generator-tool';
import { BrowserMockup } from '@/components/browser-mockup';
import { DebugConsole } from '@/components/debug-console';
import { DebugConsoleProvider } from '@/lib/debug-console-context';
import { Sidebar } from '@/components/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { WordPressGeneratorProvider, useWordPressGenerator } from '@/lib/wordpress-generator-context';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ProjectProvider, useProject } from '@/lib/project-context';
import { Button } from '@/components/ui/button';
import '../../../styles/app.css';
import { ContentGeneratorToolUI } from '@/components/tools/content-generator-tool';
import { Project } from '@/types/Project';
interface CodeFile {
  path: string;
  code: string;
}

function ProjectContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { project, setProject } = useProject();
  const [customer, setCustomer] = useState<{ customer_id: string; email: string; open_ai_api_key: string } | null>(
    null,
  );
  const { addProject } = useWordPressGenerator();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    async function loadProject() {
      try {
        const { data: projectData, error } = await supabase
          .from('projects')
          .select('id, customer_id, name, content_url, code, messages, created_at, updated_at, type')
          .eq('id', projectId)
          .single();

        if (error) {
          // console.error('Error loading project:', error);
          setError('Project not found');
          return;
        }

        if (!projectData) {
          setError('Project not found');
          return;
        }

        setProject(projectData);

        // Customer data

        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('customer_id, email, open_ai_api_key')
          .eq('customer_id', projectData.customer_id)
          .single();

        if (customerError) {
          setError('Customer not found');
          return;
        }

        setCustomer(customerData);

        document.title = `${projectData.name} - WordPress AI`;

        // Update WordPress generator context with code data
        if (projectData.code && projectData.code.length > 0) {
          const wordpressFiles = projectData.code.map((file: CodeFile) => ({
            path: file.path,
            code: file.code,
          }));

          // Add or update project in WordPress generator context
          addProject({
            type: 'plugin', // Default to plugin, you might want to make this configurable
            name: projectData.name,
            description: '', // Add description if needed
            files: wordpressFiles,
          });
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setError('An error occurred while loading the project');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, supabase, setProject, addProject]);

  const runtime = useChatRuntime({
    api: '/api/chat',
    body: {
      customer,
      project,
    },
    adapters: {
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
    onError: (error) => {
      console.error('Error in chat runtime:', error);
    },
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{error}</h1>
          <p className="text-muted-foreground">
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push('/dashboard/projects')} className="mt-4">
            Go to Projects Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DebugConsoleProvider>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="relative min-h-screen">
          <HomePageBackground />
          <div className="h-dvh flex relative z-10">
            <Sidebar />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={25} minSize={22} maxSize={40}>
                <div className="h-full border-r overflow-auto bg-background/70 backdrop-blur-[6px]">
                  <Thread project={project as Project} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <div className="h-full flex flex-col">
                  <WordPressGeneratorToolUI />
                  <ContentGeneratorToolUI />
                  <div className="flex-1 flex flex-col min-h-0 p-0">
                    <ResizablePanelGroup direction="vertical" className="h-full">
                      <ResizablePanel defaultSize={75}>
                        <div className="h-full overflow-auto">
                          <BrowserMockup>
                            <WordPressPlayground content_url={project?.content_url} />
                          </BrowserMockup>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={9} minSize={9} maxSize={75} id="debug-console-panel">
                        <div className="h-full flex flex-col">
                          <DebugConsole />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </AssistantRuntimeProvider>
    </DebugConsoleProvider>
  );
}

export default function ProjectPage() {
  return (
    <ProjectProvider>
      <WordPressGeneratorProvider>
        <ProjectContent />
      </WordPressGeneratorProvider>
    </ProjectProvider>
  );
}
