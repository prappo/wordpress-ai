import { tool } from 'ai';
import { z } from 'zod';
// import { searchUnsplashImage } from '../utils/unsplash';

const PageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string().describe('The content of the page with WordPress gutenberg blocks with changeable color and font'),
  template: z.string().optional(),
  meta: z.record(z.any()).optional(),
  prompt: z.string().optional().describe('A extended prompt for the content generator'),
});

const contentGenerator = tool({
  description: 'Generate content for multiple WordPress pages with WordPress gutenberg patterns',
  parameters: z.object({
    pages: z.array(PageSchema),
    siteInfo: z.object({
      title: z.string(),
      description: z.string().optional(),
      theme: z.string().optional(),
    }),
  }),
  execute: async ({ pages, siteInfo }) => {
    // Process each page's content
    const processedPages = await Promise.all(
      pages.map(async (page) => {
        const processedContent = page.content;

        return {
          ...page,
          content: processedContent,
        };
      }),
    );

    return {
      pages: processedPages,
      siteInfo,
    };
  },
});

export default contentGenerator;
