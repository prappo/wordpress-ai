"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { memo, useMemo } from 'react';

interface CodeHighlighterProps {
  code: string;
  language?: string;
}

// Memoize the component to prevent unnecessary re-renders
export const CodeHighlighter = memo(function CodeHighlighter({ 
  code, 
  language = 'typescript' 
}: CodeHighlighterProps) {
  // Memoize the style object to prevent recreation on each render
  const customStyle = useMemo(() => ({
    margin: 0,
    padding: '1rem',
    backgroundColor: 'rgb(30, 30, 30)',
    borderRadius: '0.375rem',
  }), []);

  // Truncate very long code to prevent performance issues
  const truncatedCode = useMemo(() => {
    const maxLength = 10000; // Adjust this value based on your needs
    if (code.length > maxLength) {
      return code.slice(0, maxLength) + '\n// ... (truncated)';
    }
    return code;
  }, [code]);

  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={customStyle}
        showLineNumbers
        wrapLines
        // Performance optimizations
        wrapLongLines={true}
        useInlineStyles={true}
        showInlineLineNumbers={true}
        lineNumberStyle={{ minWidth: '2.5em' }}
        codeTagProps={{
          style: {
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }
        }}
      >
        {truncatedCode}
      </SyntaxHighlighter>
    </div>
  );
}); 