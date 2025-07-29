"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface ProjectData {
  id: string;
  name: string;
  content_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages?: any[];
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  project: ProjectData | null;
  setProject: (project: ProjectData | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectData | null>(null);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
} 