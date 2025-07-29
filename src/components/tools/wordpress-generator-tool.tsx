'use client';

import { makeAssistantToolUI } from "@assistant-ui/react";
import { getWordPressClient } from '@/lib/wordpress-client';
import { useEffect, useState } from 'react';
import { useWordPressGenerator } from '@/lib/wordpress-generator-context';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { CodeHighlighter } from "@/components/code-highlighter";

type WordPressGeneratorArgs = {
  type: "plugin" | "theme";
  name: string;
  description: string;
  files: Array<{
    path: string;
    code: string;
  }>;
};

type WordPressGeneratorResult = {
  success: boolean;
  message: string;
  type?: string;
  name?: string;
  description?: string;
  files?: Array<{
    path: string;
    code: string;
  }>;
};

type FileType = {
  path: string;
  code: string;
};

// Function to sanitize directory names according to WordPress conventions
const sanitizeDirectoryName = (name: string): string => {
  // Convert to lowercase
  let sanitized = name.toLowerCase();
  
  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-');
  
  // Remove any characters that aren't alphanumeric, hyphens, or underscores
  sanitized = sanitized.replace(/[^a-z0-9-_]/g, '');
  
  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');
  
  return sanitized;
};

// Function to ensure parent directories exist
const ensureDirectoryExists = async (client: { mkdir: (path: string) => Promise<void> }, filePath: string) => {
  const parts = filePath.split('/').filter(Boolean);
  let currentPath = '';
  
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath += '/' + parts[i];
    try {
      await client.mkdir(currentPath);
    } catch (error) {
      // Ignore error if directory already exists
      if (!(error instanceof Error && error.message.includes('already exists'))) {
        throw error;
      }
    }
  }
};

const FileItem = ({ file, status }: { file: FileType; status: string }) => {
  const [showCode, setShowCode] = useState(false);

  const getDisplayPath = (path: string) => {
    const parts = path.split('/');
    const pluginOrThemeIndex = parts.findIndex(p => p === 'plugins' || p === 'themes');
    if (pluginOrThemeIndex === -1) return path;
    return parts.slice(pluginOrThemeIndex).join('/');
  };

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
  
  return (
    <Card className="mb-2">
      <div className="flex items-center p-2">
        <div className="flex items-center min-w-[40px]">
          {status === 'Pending' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === 'Generated' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {status === 'Error' && (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          {status === 'Generating' && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0 px-2">
          <div 
            className="font-medium truncate flex items-center gap-2 cursor-pointer hover:text-primary"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FileText className="h-4 w-4" />
            {getDisplayPath(file.path)}
          </div>
        </div>
      </div>
      {showCode && (
        <div className="p-4 border-t">
          <CodeHighlighter 
            code={file.code} 
            language={getLanguageFromPath(file.path)} 
          />
        </div>
      )}
    </Card>
  );
};

const WordPressGeneratorToolComponent = ({ args, status, result }: { 
  args: WordPressGeneratorArgs; 
  status: { readonly type: "running" | "complete" | "incomplete" | "requires-action"; readonly reason?: "length" | "cancelled" | "content-filter" | "other" | "error" | "tool-calls"; readonly error?: unknown };
  result?: WordPressGeneratorResult;
}) => {
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'executing' | 'completed' | 'error'>('idle');
  const [executionMessage, setExecutionMessage] = useState<string>('');
  const [executionDetails, setExecutionDetails] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, string>>({});
  const { addProject, updateProject, getProject } = useWordPressGenerator();

  useEffect(() => {
    const executeCode = async () => {
      if (status.type === "complete" && result) {
        const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
        
        if (parsedResult.success && parsedResult.files) {
          try {
            setExecutionStatus('executing');
            setExecutionMessage('Initializing WordPress client...');
            setExecutionDetails(['Connecting to WordPress Playground...']);
            
            // Initialize file statuses
            const initialStatuses: Record<string, string> = {};
            parsedResult.files.forEach((file: FileType) => {
              initialStatuses[file.path] = 'Pending';
            });
            setFileStatuses(initialStatuses);
            
            // Get the WordPress client
            const client = getWordPressClient();
            setExecutionDetails(prev => [...prev, 'WordPress client initialized successfully']);
            
            // Sanitize the directory name
            const sanitizedName = sanitizeDirectoryName(parsedResult.name || args.name);
            setExecutionDetails(prev => [...prev, `Original name: "${parsedResult.name || args.name}"`]);
            setExecutionDetails(prev => [...prev, `Sanitized name: "${sanitizedName}"`]);
            
            // Create base directory
            const baseDir = parsedResult.type === "plugin" 
              ? `/wordpress/wp-content/plugins/${sanitizedName}`
              : `/wordpress/wp-content/themes/${sanitizedName}`;
            
            setExecutionDetails(prev => [...prev, `Creating directory: ${baseDir}`]);
            await client.mkdir(baseDir);
            setExecutionDetails(prev => [...prev, `Directory created: ${baseDir}`]);
            
            // Check if project already exists
            const existingProject = getProject(sanitizedName);
            
            if (existingProject) {
              // Update existing project
              updateProject(sanitizedName, parsedResult.files);
              setExecutionDetails(prev => [...prev, `Updated existing project: ${sanitizedName}`]);
            } else {
              // Create new project
              addProject({
                type: parsedResult.type,
                name: sanitizedName,
                description: parsedResult.description || args.description,
                files: parsedResult.files
              });
              setExecutionDetails(prev => [...prev, `Created new project: ${sanitizedName}`]);
            }
            
            // Write all files
            setExecutionDetails(prev => [...prev, `Writing ${parsedResult.files.length} files...`]);
            
            for (const file of parsedResult.files) {
              // Update status to generating
              setFileStatuses(prev => ({...prev, [file.path]: 'Generating'}));
              
              // Sanitize the file path
              const originalPath = file.path;
              // Only replace the first occurrence of the name in the path
              const sanitizedPath = originalPath.replace(
                new RegExp(`(${parsedResult.name || args.name})(?=/|$)`), 
                sanitizedName
              );
              
              setExecutionDetails(prev => [...prev, `Original path: ${originalPath}`]);
              setExecutionDetails(prev => [...prev, `Sanitized path: ${sanitizedPath}`]);
              
              try {
                // Ensure parent directories exist
                await ensureDirectoryExists(client, sanitizedPath);
                
                await client.writeFile(sanitizedPath, file.code);
                setExecutionDetails(prev => [...prev, `File written successfully: ${sanitizedPath}`]);
                // Update status to success
                setFileStatuses(prev => ({...prev, [file.path]: 'Generated'}));
              } catch (fileError) {
                console.error(`Error writing file ${sanitizedPath}:`, fileError);
                setExecutionDetails(prev => [...prev, `Error writing file ${sanitizedPath}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`]);
                // Update status to error
                setFileStatuses(prev => ({...prev, [file.path]: 'Error'}));
                
                // Continue with other files even if one fails
                continue;
              }
            }

            await client.getCurrentURL().then((url) => {
              client.goTo(url);
            });
            
            setExecutionStatus('completed');
            setExecutionMessage('Code successfully executed in WordPress Playground');
            setExecutionDetails(prev => [...prev, 'All files have been written successfully']);
          } catch (error) {
            console.error('Error executing code:', error);
            
            // Check if the error is "Playground already booted"
            if (error instanceof Error && error.message.includes("Playground already booted")) {
              setExecutionStatus('completed');
              setExecutionMessage('Code successfully executed in WordPress Playground');
              setExecutionDetails(prev => [...prev, 'All files have been written successfully']);
              return;
            }
            
            setExecutionStatus('error');
            setExecutionMessage(`Error executing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setExecutionDetails(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
          }
        }
      }
    };

    executeCode();
  }, [status, result]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status.type === "running") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <div>Generating {args.type} &quot;{args.name}&quot;...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated {args.type}: {args.name}</CardTitle>
          <CardDescription>{args.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm px-2 py-1 rounded bg-muted">
              {executionStatus === 'executing' && 'Executing...'}
              {executionStatus === 'completed' && 'Completed'}
              {executionStatus === 'error' && 'Error'}
              {executionStatus === 'idle' && 'Idle'}
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Files</h4>
            {parsedResult.files?.map((file: FileType, index: number) => (
              <FileItem 
                key={index} 
                file={file} 
                status={fileStatuses[file.path] || 'Pending'} 
              />
            ))}
          </div>
          
          {executionStatus === 'executing' && (
            <Alert className="mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Executing code in WordPress Playground...</AlertTitle>
              <AlertDescription>
                <div className="mt-2">{executionMessage}</div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show details</summary>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {executionDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </details>
              </AlertDescription>
            </Alert>
          )}
          {executionStatus === 'completed' && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{executionMessage}</AlertTitle>
              <AlertDescription>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show details</summary>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {executionDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </details>
              </AlertDescription>
            </Alert>
          )}
          {executionStatus === 'error' && (
            <Alert className="mt-4" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>{executionMessage}</AlertTitle>
              <AlertDescription>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show details</summary>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {executionDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </details>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generating {args.type}: {args.name}</CardTitle>
        <CardDescription>{args.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <h4 className="font-medium mb-2">Files</h4>
          {args.files.map((file: FileType, index: number) => (
            <FileItem 
              key={index} 
              file={file} 
              status="Pending" 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const WordPressGeneratorToolUI = makeAssistantToolUI<WordPressGeneratorArgs, WordPressGeneratorResult>({
  toolName: "codeGenerator",
  render: WordPressGeneratorToolComponent,
}); 