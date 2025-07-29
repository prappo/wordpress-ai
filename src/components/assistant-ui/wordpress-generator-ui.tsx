import { makeAssistantToolUI } from "@assistant-ui/react";

import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

type WordPressGeneratorArgs = {
  type: "plugin" | "theme";
  name: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
  }>;
};

type WordPressGeneratorResult = {
  success: boolean;
  message: string;
};

export const WordPressGeneratorUI = makeAssistantToolUI<WordPressGeneratorArgs, WordPressGeneratorResult>({
  toolName: "wordpress_generator",
  render: ({ args, result, status }) => {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">
            Generating {args.type}: {args.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{args.description}</p>

        <div className="space-y-2">
          {args.files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{file.path}</span>
              {status.type === "complete" && result?.success && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {status.type === "complete" && !result?.success && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          ))}
        </div>

        {status.type === "complete" && (
          <div className="mt-4">
            <p className={`text-sm ${result?.success ? "text-green-500" : "text-red-500"}`}>
              {result?.message}
            </p>
          </div>
        )}
      </div>
    );
  },
}); 