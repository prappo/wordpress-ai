'use client';

import { makeAssistantToolUI } from '@assistant-ui/react';
import { getWordPressClient } from '@/lib/wordpress-client';
import { FileText, CheckCircle2 } from 'lucide-react';
import type { PlaygroundClient } from '@wp-playground/client';
import { useEffect } from 'react';

type Page = {
  title: string;
  slug: string;
  content: string;
  template?: string;
  meta?: Record<string, string | number | boolean>;
};

type SiteInfo = {
  title: string;
  description?: string;
  theme?: string;
};

type ContentGeneratorArgs = {
  pages: Page[];
  siteInfo: SiteInfo;
};

type ContentGeneratorResult = {
  pages: Page[];
  siteInfo: SiteInfo;
};

const createOrUpdatePage = async (client: PlaygroundClient, page: Page) => {

  try {
    // First, try to find existing page
    const pages = await client.run({
      code: `
<?php
require_once('/wordpress/wp-load.php');

$pages = get_posts(array(
    'post_type' => 'page',
    'name' => '${page.slug.replace(/'/g, "\\'")}',
    'posts_per_page' => 1
));

if ($pages) {
    echo json_encode($pages);
} else {
    echo '[]';
}
`
    });

    const parsedPages = JSON.parse(pages.text);
    
    if (parsedPages && parsedPages.length > 0) {
      // Update existing page
      const result = await client.run({
        code: `
<?php
require_once('/wordpress/wp-load.php');

$update_page = array(
    'ID' => ${parsedPages[0].ID},
    'post_title' => '${page.title.replace(/'/g, "\\'")}',
    'post_content' => '${page.content.replace(/'/g, "\\'")}',
    'post_status' => 'publish',
    'post_name' => '${page.slug.replace(/'/g, "\\'")}'
);

$result = wp_update_post($update_page);
if ($result && !is_wp_error($result)) {
    echo json_encode(get_post($result));
} else {
    echo json_encode(array('error' => $result->get_error_message()));
}
`
      });
      return JSON.parse(result.text);
    } else {
      // Create new page
      const result = await client.run({
        code: `
<?php
require_once('/wordpress/wp-load.php');

$new_page = array(
    'post_title' => '${page.title.replace(/'/g, "\\'")}',
    'post_content' => '${page.content.replace(/'/g, "\\'")}',
    'post_status' => 'publish',
    'post_type' => 'page',
    'post_name' => '${page.slug.replace(/'/g, "\\'")}'
);

$page_id = wp_insert_post($new_page);
if ($page_id && !is_wp_error($page_id)) {
    echo json_encode(get_post($page_id));
} else {
    echo json_encode(array('error' => $page_id->get_error_message()));
}
`
      });
      return JSON.parse(result.text);
    }
  } catch (error) {
    console.error('Error creating/updating page:', error);
    throw error;
  }
};

const ContentGeneratorToolComponent = ({
  args,
  status,
  result,
}: {
  args?: ContentGeneratorArgs;
  status: {
    readonly type: 'running' | 'complete' | 'incomplete' | 'requires-action';
    readonly reason?: 'length' | 'cancelled' | 'content-filter' | 'other' | 'error' | 'tool-calls';
    readonly error?: unknown;
  };
  result?: ContentGeneratorResult;
}) => {
  const client = getWordPressClient();
  
  useEffect(() => {
    const executeCode = async () => {
      if (status.type === 'complete' && result?.pages) {
        try {
          // Create/update each page
          for (const page of result.pages) {
            const createdPage = await createOrUpdatePage(client, page);
            
            // Navigate to the last created/updated page
            if (createdPage && !createdPage.error) {
              await client.goTo(`/wp-admin/post.php?post=${createdPage.ID}&action=edit`);
            }
          }
        } catch (error) {
          console.error('Error executing WordPress API:', error);
        }
      }
    };
    
    executeCode();
  }, [status.type, result?.pages, client]);

  if (!args) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="font-semibold">
          {status.type === 'complete' ? 'Creating' : 'Creating'} Pages for {args.siteInfo?.title || 'Website'}
        </h3>
      </div>

      <div className="space-y-4">
        {args.pages?.map((page) => (
          <div key={page.slug} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{page.title}</span>
              {status.type === "complete" && result && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
            {page.template && (
              <div className="text-sm text-muted-foreground">
                Template: {page.template}
              </div>
            )}
          </div>
        ))}
      </div>

      {status.type === "complete" && result && (
        <div className="mt-4 text-sm text-muted-foreground">
          Pages have been created successfully. You can now edit them in the WordPress editor.
        </div>
      )}
    </div>
  );
};

export const ContentGeneratorToolUI = makeAssistantToolUI<ContentGeneratorArgs, ContentGeneratorResult>({
  toolName: 'contentGenerator',
  render: ContentGeneratorToolComponent,
});
