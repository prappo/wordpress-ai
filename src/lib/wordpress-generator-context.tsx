'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import JSZip from 'jszip';

interface WordPressFile {
  path: string;
  code: string;
}

interface WordPressProject {
  type: 'plugin' | 'theme';
  name: string;
  description: string;
  files: WordPressFile[];
  lastModified: Date;
}

interface WordPressGeneratorContextType {
  projects: WordPressProject[];
  addProject: (project: Omit<WordPressProject, 'lastModified'>) => void;
  updateProject: (name: string, files: WordPressFile[]) => void;
  removeProject: (name: string) => void;
  getProject: (name: string) => WordPressProject | undefined;
  downloadProject: (name: string) => void;
}

const WordPressGeneratorContext = createContext<WordPressGeneratorContextType | undefined>(undefined);

export function WordPressGeneratorProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<WordPressProject[]>([]);

  const addProject = (project: Omit<WordPressProject, 'lastModified'>) => {
    setProjects(prev => {
      // Check if project already exists
      const existingIndex = prev.findIndex(p => p.name === project.name);
      if (existingIndex !== -1) {
        // Update existing project
        const updated = [...prev];
        updated[existingIndex] = {
          ...project,
          lastModified: new Date()
        };
        return updated;
      }
      // Add new project
      return [...prev, { ...project, lastModified: new Date() }];
    });
  };

  const updateProject = (name: string, files: WordPressFile[]) => {
    setProjects(prev => 
      prev.map(project => {
        if (project.name === name) {
          // Create a map of existing files
          const existingFiles = new Map(project.files.map(f => [f.path, f]));
          
          // Update or add new files
          files.forEach(file => {
            existingFiles.set(file.path, file);
          });
          
          return {
            ...project,
            files: Array.from(existingFiles.values()),
            lastModified: new Date()
          };
        }
        return project;
      })
    );
  };

  const removeProject = (name: string) => {
    setProjects(prev => prev.filter(project => project.name !== name));
  };

  const getProject = (name: string) => {
    return projects.find(project => project.name === name);
  };

  const downloadProject = (name: string) => {
    const project = getProject(name);
    if (!project) return;

    // Create a zip file
    const zip = new JSZip();
    
    // Add all files to the zip with corrected paths
    project.files.forEach(file => {
      // Extract the path after the theme/plugin directory
      const pathParts = file.path.split('/');
      const pluginOrThemeIndex = pathParts.findIndex(p => p === 'plugins' || p === 'themes');
      if (pluginOrThemeIndex !== -1) {
        // Get the path relative to the theme/plugin directory
        const relativePath = pathParts.slice(pluginOrThemeIndex + 2).join('/');
        zip.file(relativePath, file.code);
      } else {
        // If no theme/plugin directory found, use the original path
        zip.file(file.path, file.code);
      }
    });

    // Generate and download the zip file
    zip.generateAsync({ type: 'blob' })
      .then(content => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <WordPressGeneratorContext.Provider 
      value={{ 
        projects, 
        addProject, 
        updateProject, 
        removeProject, 
        getProject,
        downloadProject
      }}
    >
      {children}
    </WordPressGeneratorContext.Provider>
  );
}

export function useWordPressGenerator() {
  const context = useContext(WordPressGeneratorContext);
  if (context === undefined) {
    throw new Error('useWordPressGenerator must be used within a WordPressGeneratorProvider');
  }
  return context;
} 