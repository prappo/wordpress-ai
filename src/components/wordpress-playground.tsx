'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { startPlaygroundWeb, zipWpContent } from '@wp-playground/client';
import { useDebugConsole } from '@/lib/debug-console-context';
import JSZip from 'jszip';

declare global {
  interface Window {
    client: Awaited<ReturnType<typeof startPlaygroundWeb>>;
  }
}

interface WordPressPlaygroundProps {
  content_url?: string;
}

type PlaygroundStep =
  | {
      step: 'login';
      username: string;
      password: string;
    }
  | {
      step: 'importWordPressFiles';
      wordPressFilesZip: {
        resource: 'url';
        url: string;
      };
    }
  | {
      step: 'wp-cli';
      command: string;
    }
  | {
      step: 'runPHP';
      code: string;
    };

export default function WordPressPlayground({ content_url }: WordPressPlaygroundProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { addMessage } = useDebugConsole();
  const clientRef = useRef<Awaited<ReturnType<typeof startPlaygroundWeb>> | null>(null);
  const addMessageRef = useRef(addMessage);

  // Update the ref when addMessage changes
  useEffect(() => {
    addMessageRef.current = addMessage;
  }, [addMessage]);

  const handleMessage = useCallback(async (message: string) => {
    if (!clientRef.current) return;

    if (message === 'downloadZipFile') {
      const zipContent = await zipWpContent(clientRef.current);

      // Create a new JSZip instance to restructure the content
      const newZip = new JSZip();
      const originalZip = await JSZip.loadAsync(zipContent);

      // Process each file in the original zip
      originalZip.forEach((relativePath, zipEntry) => {
        // Skip if it's a directory
        if (zipEntry.dir) return;

        // Only include files from wp-content directory
        if (relativePath.startsWith('wordpress/wp-content/')) {
          // Remove the 'wordpress/wp-content/' prefix
          const newPath = relativePath.replace(/^wordpress\/wp-content\//, '');
          newZip.file(newPath, zipEntry.async('uint8array'));
        }
      });

      // Generate the new zip content
      const newZipContent = await newZip.generateAsync({ type: 'uint8array' });

      downloadZipFile(newZipContent, 'wp-content.zip');
    } else {
      addMessageRef.current(`Message received: ${JSON.stringify(message)}`, 'info');
    }
  }, []); // No dependencies needed since we're using refs

  useEffect(() => {
    async function initializePlayground() {
      if (!iframeRef.current) return;

      try {
        let steps: PlaygroundStep[] = [
          // {
          //   step: 'importWordPressFiles',
          //   wordPressFilesZip: {
          //     resource: 'url',
          //     url: '/demo.zip',
          //   },
          // },
//           {
//             step: 'runPHP',
//             code: `<?php 
//               require_once 'wordpress/wp-load.php';
              
//               // Create home page with dummy content
//               $home_page = array(
//                 'post_title'    => 'Welcome to WordPressAI',
//                 'post_content'  => '<!-- wp:paragraph -->
// <p>WordPressAI provides AI powered tool to create a WordPress plugin or theme in minutes without any coding skills.</p>
// <p>We often try to implement our own ideas in WordPress, but we do not have time to code it or we do not have the skills to code it. So we created WordPressAI to help people like you to bring your ideas to life.</p>
// <p><i>This is a sample home page created automatically.</i></p>
// <p><i>You can add your own content here.</i></p>
// <!-- /wp:paragraph -->',
//                 'post_status'   => 'publish',
//                 'post_type'     => 'page',
//                 'post_author'   => 1
//               );
              
//               $home_page_id = wp_insert_post($home_page);
              
//               // Set the home page as static front page
//               update_option('show_on_front', 'page');
//               update_option('page_on_front', $home_page_id);
//             ?>`,
//           },
//           {
//             step: 'wp-cli',
//             command: "wp option update permalink_structure '/%postname%/'",
//           },
//           {
//             step: 'wp-cli',
//             command: 'wp rewrite flush',
//           },
          {
            step: 'login',
            username: 'admin',
            password: 'password',
          },
        ];

        // Add import step if content_url is provided
        if (content_url) {
          steps = [
            {
              step: 'importWordPressFiles',
              wordPressFilesZip: {
                resource: 'url',
                url: content_url + '?time=' + Date.now(),
              },
            },
            {
              step: 'login',
              username: 'admin',
              password: 'password',
            },
          ];
        }

        const client = await startPlaygroundWeb({
          iframe: iframeRef.current,
          remoteUrl: `https://playground.wordpress.net/remote.html`,
          blueprint: {
            landingPage: '/',
            preferredVersions: {
              wp: 'latest',
              php: '8.0',
            },
            extraLibraries: ['wp-cli'],
            steps,
            features: {
              networking: false,
            },
          },
        });

        // Store the client in ref
        clientRef.current = client;

        // Wait until Playground is fully loaded
        await client.isReady().then(() => {
          addMessageRef.current('Playground is ready', 'success');
        });

        // Store the client globally
        window.client = client;

        // Register message handler
        client.onMessage(handleMessage);

        // Cleanup function
        return () => {
          client.onMessage(() => {});
        };
      } catch (error) {
        addMessageRef.current(`Failed to initialize WordPress Playground: ${error}`, 'error');
      }
    }

    initializePlayground();
  }, [content_url]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full h-full">
      <iframe ref={iframeRef} id="wp" className="w-full h-full border-0" title="WordPress Playground" />
    </div>
  );
}

export function downloadZipFile(zipContent: Uint8Array, filename: string) {
  const blob = new Blob([zipContent], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
