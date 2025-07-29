import React, { useState, useMemo, useEffect } from 'react';
import { useWordPressGenerator } from '@/lib/wordpress-generator-context';
import { zipWpContent, exportWXR } from '@wp-playground/client';
import { createBrowserClient } from '@supabase/ssr';
import { useChatRuntime } from '@assistant-ui/react-ai-sdk';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Download,
  Code,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  X,
  Share2,
  LoaderIcon,
  ExternalLink,
  MoreVertical,
  Zap,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import JSZip from 'jszip';
import { CodeHighlighter } from '@/components/code-highlighter';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Removed upgrade message - all features are now available

interface BrowserMockupProps {
  children: React.ReactNode;
}

// File display item type
type FileDisplayItem = {
  path: string;
  code: string;
  expanded: boolean;
};

// Tree node for file system representation
type TreeNode = {
  name: string;
  isDirectory: boolean;
  children: TreeNode[];
  path: string;
  code?: string;
  expanded: boolean;
};

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

export function BrowserMockup({ children }: BrowserMockupProps) {
  const { projects, downloadProject } = useWordPressGenerator();
  const { toast } = useToast();
  const runtime = useChatRuntime({ api: '/api/chat' });
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const [showCodeView, setShowCodeView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [displayFiles, setDisplayFiles] = useState<FileDisplayItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode>({
    name: 'root',
    isDirectory: true,
    children: [],
    path: '',
    expanded: true,
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  // Removed upgrade dialog state - all features are now available

  // Update current URL when it changes in the playground
  useEffect(() => {
    const updateUrl = async () => {
      if (window.client && !isEditingUrl) {
        try {
          const url = await window.client.getCurrentURL();
          setCurrentUrl(url);
          setInputUrl(url);
        } catch (error) {
          console.error('Error getting current URL:', error);
        }
      }
    };

    updateUrl();
    // Set up an interval to check for URL changes
    const interval = setInterval(updateUrl, 1000);
    return () => clearInterval(interval);
  }, [isEditingUrl]);

  // Handle fullscreen change
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Build file tree from flat list of files
  const buildFileTree = (files: FileDisplayItem[]): TreeNode => {
    const root: TreeNode = {
      name: 'root',
      isDirectory: true,
      children: [],
      path: '',
      expanded: true,
    };

    files.forEach((file) => {
      const pathParts = file.path.split('/').filter(Boolean);
      let currentNode = root;

      // Process each part of the path
      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        const fullPath = pathParts.slice(0, index + 1).join('/');

        // Try to find existing node
        let childNode = currentNode.children.find((child) => child.name === part);

        if (!childNode) {
          // Create a new node
          childNode = {
            name: part,
            isDirectory: !isLastPart,
            children: [],
            path: fullPath,
            expanded: false,
          };

          // If it's a file, add the code
          if (isLastPart) {
            childNode.code = file.code;
          }

          currentNode.children.push(childNode);
        }

        currentNode = childNode;
      });
    });

    return root;
  };

  // Toggle the code preview
  const toggleCodeView = () => {
    // If we're opening the code view, prepare the file list and tree
    if (!showCodeView && projects.length > 0) {
      // Get all files from all projects and set their initial state to collapsed
      const allFiles = projects.flatMap((project) =>
        project.files.map((file) => ({
          ...file,
          expanded: false,
        })),
      );
      setDisplayFiles(allFiles);

      // Build the file tree
      const tree = buildFileTree(allFiles);
      setFileTree(tree);

      // Select the first file by default if available
      if (allFiles.length > 0) {
        setSelectedFilePath(allFiles[0].path);
      }
    }
    setShowCodeView(!showCodeView);
  };

  // Toggle directory expansion in tree
  const toggleDirectoryExpansion = (nodePath: string) => {
    setFileTree((prevTree) => {
      // Clone the tree to avoid mutation
      const newTree = JSON.parse(JSON.stringify(prevTree));

      // Find the node to toggle
      const findAndToggle = (node: TreeNode, path: string): boolean => {
        if (node.path === path) {
          node.expanded = !node.expanded;
          return true;
        }

        if (node.children) {
          for (const child of node.children) {
            if (findAndToggle(child, path)) {
              return true;
            }
          }
        }

        return false;
      };

      findAndToggle(newTree, nodePath);
      return newTree;
    });
  };

  // Select a file to display its code
  const selectFile = (path: string) => {
    setSelectedFilePath(path);
  };

  // Get the currently selected file's code
  const selectedFileCode = useMemo(() => {
    if (!selectedFilePath) return '';

    // First try to find it in the flat files list
    const flatFile = displayFiles.find((f) => f.path === selectedFilePath);
    if (flatFile) return flatFile.code;

    // If not found, search in the tree
    const findFileInTree = (node: TreeNode): string | null => {
      if (!node.isDirectory && node.path === selectedFilePath && node.code) {
        return node.code;
      }

      if (node.children) {
        for (const child of node.children) {
          const found = findFileInTree(child);
          if (found) return found;
        }
      }

      return null;
    };

    return findFileInTree(fileTree) || '';
  }, [displayFiles, selectedFilePath, fileTree]);

  // Get language from file path
  const getLanguageFromPath = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'php':
        return 'php';
      case 'js':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  };

  // Simplify display path for better UI
  const getDisplayPath = (path: string) => {
    const parts = path.split('/');
    const pluginOrThemeIndex = parts.findIndex((p) => p === 'plugins' || p === 'themes');
    if (pluginOrThemeIndex === -1) return path;
    return parts.slice(pluginOrThemeIndex).join('/');
  };

  // Render tree node recursively
  const renderTreeNode = (node: TreeNode, level = 0) => {
    const paddingLeft = level * 12; // Increase padding for nested levels

    if (node.isDirectory) {
      return (
        <div key={node.path || 'root'}>
          {node.name !== 'root' && (
            <div
              className="flex items-center cursor-pointer hover:bg-gray-700/50 rounded p-1"
              onClick={() => toggleDirectoryExpansion(node.path)}
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              {node.expanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />
              )}
              <Folder className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-200">{node.name}</span>
            </div>
          )}

          {(node.expanded || node.name === 'root') &&
            node.children.map((child) => renderTreeNode(child, node.name === 'root' ? level : level + 1))}
        </div>
      );
    } else {
      // File node
      return (
        <div
          key={node.path}
          className={`flex items-center cursor-pointer p-1 rounded ${
            selectedFilePath === node.path ? 'bg-gray-700' : 'hover:bg-gray-700/50'
          }`}
          onClick={() => node.code && selectFile(node.path)}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <FileText className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-200 truncate">{node.name}</span>
        </div>
      );
    }
  };

  const handleRefresh = async () => {
    if (window.client) {
      try {
        setIsRefreshing(true);
        await window.client.getCurrentURL().then((url) => {
          window.client.goTo(url);
        });
      } catch (error) {
        console.error('Error refreshing playground:', error);
        toast({
          title: 'Error',
          description: 'Failed to refresh the playground',
          variant: 'destructive',
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (window.client && inputUrl) {
      try {
        await window.client.goTo(inputUrl);
        setCurrentUrl(inputUrl);
        setIsEditingUrl(false);
      } catch (error) {
        console.error('Error navigating to URL:', error);
        toast({
          title: 'Error',
          description: 'Failed to navigate to the specified URL',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleUrlBlur = () => {
    setIsEditingUrl(false);
    setInputUrl(currentUrl); // Reset to current URL if not submitted
  };

  const handleShare = async () => {
    try {
      setIsSaving(true);

      // All users have access to sharing feature

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

      let zipBlob: Blob;
      const currentProjectFiles: WordPressFile[] = [];

      if (window.client) {
        try {
          console.log('Share: Starting wp-content zip process...');
          const zipContent = await zipWpContent(window.client);
          console.log(`Share: Original zip size: ${zipContent.byteLength} bytes`);

          const newZip = new JSZip();
          const originalZip = await JSZip.loadAsync(zipContent);
          console.log('Share: Original zip loaded. Files:', Object.keys(originalZip.files));

          const filePromises: Promise<void>[] = [];

          originalZip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && relativePath.startsWith('wp-content/')) {
              filePromises.push(
                zipEntry.async('uint8array').then((content) => {
                  newZip.file(relativePath, content);
                  try {
                    const decodedCode = new TextDecoder('utf-8', { fatal: true }).decode(content);
                    if (!decodedCode.includes('\u0000')) {
                      currentProjectFiles.push({ path: relativePath, code: decodedCode });
                    }
                  } catch (decodeError) {
                    console.warn(`Skipping metadata for ${relativePath}: Not valid UTF-8 text.`, decodeError);
                  }
                }),
              );
            }
          });

          await Promise.all(filePromises);
          const newZipContent = await newZip.generateAsync({ type: 'uint8array' });
          zipBlob = new Blob([newZipContent], { type: 'application/zip' });
        } catch (error) {
          console.error('Error creating zip:', error);
          toast({
            title: 'Error preparing project files',
            description: `Could not generate zip: ${error instanceof Error ? error.message : String(error)}`,
            variant: 'destructive',
          });
          return;
        }
      } else {
        console.error('Share: window.client not found.');
        throw new Error('Playground client is not available.');
      }

      // Upload the zip file
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

      // Update the project
      const dataToSave: ProjectData = {
        name: projectData.name,
        customer_id: customer.customer_id,
        updated_at: new Date().toISOString(),
        messages: messages,
        code: currentProjectFiles,
        content_url: contentUrl,
      };

      const { error } = await supabase.from('projects').update(dataToSave).eq('id', projectId);

      if (error) {
        if (error.code === 'PGRST204') {
          const { error: retryError } = await supabase
            .from('projects')
            .update({
              name: projectData.name,
              customer_id: customer.customer_id,
              updated_at: new Date().toISOString(),
              content_url: contentUrl,
            })
            .eq('id', projectId);

          if (retryError) {
            throw retryError;
          }
        } else {
          throw error;
        }
      }

      // Set the share link and show the modal
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/share/${projectId}`);
      setShowShareModal(true);

      toast({
        title: 'Project saved and shared',
        description: 'Your project has been saved and is ready to share',
      });
    } catch (error) {
      console.error('Error sharing project:', error);
      let errorMessage = 'An unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('code' in error && 'message' in error) {
          errorMessage = `${error.message} (Code: ${error.code})`;
          if ('details' in error) {
            errorMessage += `\nDetails: ${error.details}`;
          }
        }
      }

      toast({
        title: 'Error sharing project',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`w-full h-full bg-gray-900 shadow-lg overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-200 h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex-1 mx-2">
          <form onSubmit={handleUrlSubmit} className="h-5">
            {isEditingUrl ? (
              <input
                type="text"
                value={inputUrl}
                onChange={handleUrlChange}
                onBlur={handleUrlBlur}
                className="w-full h-full px-2 bg-gray-700 rounded-full text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingUrl(true)}
                className="h-full px-2 bg-gray-700 rounded-full text-gray-200 text-sm flex items-center cursor-text"
              >
                {currentUrl}
              </div>
            )}
          </form>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-200 h-8 w-8"
            onClick={toggleCodeView}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-200 h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200 h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              {projects.length === 0 ? (
                <DropdownMenuItem disabled className="text-gray-400">
                  No projects available
                </DropdownMenuItem>
              ) : (
                projects.map((project) => (
                  <DropdownMenuItem
                    key={project.name}
                    onClick={async () => {
                      // All users have access to downloading feature
                      downloadProject(project.name);
                    }}
                    className="text-gray-200 hover:bg-gray-700"
                  >
                    Download {project.type}:{' '}
                    {project.files[0]?.path
                      .split('/')
                      .find((part, index, arr) => arr[index - 1] === 'plugins' || arr[index - 1] === 'themes') ||
                      project.name}
                  </DropdownMenuItem>
                ))
              )}
              {projects.length > 0 && <DropdownMenuSeparator className="bg-gray-700" />}
              <DropdownMenuItem
                onClick={async () => {
                  // All users have access to downloading feature

                  if (window.client) {
                    try {
                      console.log('Starting wp-content zip process...');
                      const zipContent = await zipWpContent(window.client);
                      console.log(`Original zip size: ${zipContent.byteLength} bytes`);

                      const newZip = new JSZip();
                      const originalZip = await JSZip.loadAsync(zipContent);
                      console.log('Original zip loaded. Files:', Object.keys(originalZip.files));

                      const filePromises: Promise<void>[] = [];

                      originalZip.forEach((relativePath, zipEntry) => {
                        console.log(`Processing entry: ${relativePath}, isDir: ${zipEntry.dir}`); // DEBUG: Log every entry
                        // Try filtering directly for wp-content/
                        if (!zipEntry.dir && relativePath.startsWith('wp-content/')) {
                          // Use the original relativePath if it starts with wp-content/
                          console.log(`  Adding file: ${relativePath}`); // DEBUG: Log matched files
                          filePromises.push(
                            zipEntry.async('uint8array').then((content) => {
                              // Add using the original path to keep the wp-content folder structure
                              newZip.file(relativePath, content);
                            }),
                          );
                        }
                      });

                      console.log(`Waiting for ${filePromises.length} file promises...`);
                      await Promise.all(filePromises);
                      console.log(`All file promises resolved. Total files added attempt: ${filePromises.length}`);

                      const newZipContent = await newZip.generateAsync({ type: 'uint8array' });
                      console.log(`Generated new zip size: ${newZipContent.length} bytes`);

                      if (newZipContent.length === 0) {
                        console.warn(
                          'Generated wp-content zip is empty. Check path filtering logic and original zip contents. Files processed:',
                          Object.keys(originalZip.files),
                        );
                        alert('Failed to generate wp-content zip: No files found matching criteria.');
                        return;
                      }

                      console.log('Triggering download...');
                      const blob = new Blob([newZipContent], { type: 'application/zip' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'wp-content.zip';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      console.log('Download triggered.');
                    } catch (error) {
                      console.error('Error zipping wp-content:', error);
                      alert('An error occurred while creating the wp-content zip file.');
                    }
                  } else {
                    console.warn('window.client not found when trying to zip wp-content.');
                    alert('Playground client not available.');
                  }
                }}
                className="text-gray-200 hover:bg-gray-700"
              >
                Download wp-content
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (window.client) {
                    try {
                      const xml = await exportWXR(window.client);
                      const blob = new Blob([xml], { type: 'text/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'content.xml';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error exporting WXR:', error);
                      alert('An error occurred while creating the WXR file.');
                    }
                  }
                }}
              >
                Export WXR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={handleShare}
                className="text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <LoaderIcon className="h-4 w-4 animate-spin [animation-duration:1.5s]" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement deploy functionality
                  toast({
                    title: 'Coming soon',
                    description: 'Deploy functionality will be available soon.',
                  });
                }}
                className="text-gray-200 hover:bg-gray-700 flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Deploy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-[calc(100%-2.5rem)] w-full overflow-auto bg-gray-900 relative">
        {children}

        {/* Code view overlay */}
        {showCodeView && (
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-10 flex flex-col">
            <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Generated Code Files</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-200"
                onClick={toggleCodeView}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {displayFiles.length === 0 ? (
              <div className="p-2 text-gray-400">No files available</div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                {/* Tree sidebar */}
                <div className="w-72 border-r border-gray-700 bg-gray-800 overflow-y-auto p-1">
                  {renderTreeNode(fileTree)}
                </div>

                {/* Code content area */}
                <div className="flex-1 overflow-auto bg-gray-900">
                  {selectedFilePath ? (
                    <div>
                      <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 z-10">
                        <h3 className="text-sm font-medium text-gray-200">{getDisplayPath(selectedFilePath)}</h3>
                      </div>
                      <div className="p-2">
                        <CodeHighlighter code={selectedFileCode} language={getLanguageFromPath(selectedFilePath)} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Select a file to view its contents
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-200">Share Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Share Link</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 border border-gray-700 rounded-md bg-gray-800 text-gray-200">
                  <p className="text-sm break-all">{shareLink}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast({
                    title: 'Link copied',
                    description: 'Share link has been copied to clipboard',
                  });
                }}
                className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(shareLink, '_blank');
                }}
                className="bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700 flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Removed upgrade message - all features are now available */}
    </div>
  );
}
