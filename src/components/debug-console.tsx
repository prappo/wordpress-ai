'use client';

import { useDebugConsole } from '@/lib/debug-console-context';
import { useState, useRef, useEffect } from 'react';
import { Trash2, Terminal } from 'lucide-react';
import { getWordPressClient } from '@/lib/wordpress-client';
import { wpCLI } from '@wp-playground/client';

type TabType = 'debug' | 'wp-cli';

export function DebugConsole() {
  const { messages, clearMessages } = useDebugConsole();
  const [activeTab, setActiveTab] = useState<TabType>('debug');
  const [wpCliCommand, setWpCliCommand] = useState('');
  const [wpCliHistory, setWpCliHistory] = useState<Array<{ command: string; output: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearWpCliHistory = () => {
    setWpCliHistory([]);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, wpCliHistory.length]);

  const executeWpCliCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      const client = getWordPressClient();
      const result = await wpCLI(client, { command });
      const output = result.text;

      setWpCliHistory((prev) => [...prev, { command, output }]);
      setWpCliCommand('');
    } catch (error) {
      setWpCliHistory((prev) => [
        ...prev,
        {
          command,
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ]);
    }
  };

  const handleWpCliKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeWpCliCommand(wpCliCommand);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-mono text-sm border-t border-gray-700 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">$ Debug Console</span>
            {messages.length > 0 && (
              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('debug')}
              className={`px-2 py-1 rounded ${activeTab === 'debug' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              Debug Console
            </button>
            <button
              onClick={() => setActiveTab('wp-cli')}
              className={`px-2 py-1 rounded flex items-center space-x-1 ${
                activeTab === 'wp-cli' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <Terminal className="h-4 w-4" />
              <span>WP-CLI</span>
            </button>
          </div>
        </div>
        {activeTab === 'debug' && messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </button>
        )}
        {activeTab === 'wp-cli' && wpCliHistory.length > 0 && (
          <button
            onClick={clearWpCliHistory}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Clear WP-CLI history"
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'debug' ? (
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.type === 'error' ? 'text-red-400' : msg.type === 'success' ? 'text-green-400' : 'text-gray-200'
                }`}
              >
                {`> ${msg.message}`}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="space-y-1">
              {wpCliHistory.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-green-400">$ wp {item.command}</div>
                  <div className="text-gray-200 whitespace-pre-wrap">{item.output}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">$ wp</span>
              <input
                ref={inputRef}
                type="text"
                value={wpCliCommand}
                onChange={(e) => setWpCliCommand(e.target.value)}
                onKeyDown={handleWpCliKeyDown}
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-200"
                placeholder="Enter WP-CLI command..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
