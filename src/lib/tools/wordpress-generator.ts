import { tool } from 'ai';
import { z } from 'zod';

const codeGenerator = tool({
  description: 'Generate WordPress plugins or themes',
  parameters: z.object({
    type: z.enum(['plugin', 'theme']),
    name: z.string(),
    description: z.string(),
    files: z.array(
      z.object({
        path: z.string(),
        code: z.string(),
      }),
    ),
  }),
  execute: async ({ type, name, description, files }) => {
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          // Check if code already has a header (only for main plugin/theme file)
          const isMainFile = file.path.endsWith(`${name}.php`);
          const hasHeader = file.code.includes('Plugin Name:') || file.code.includes('Theme Name:');

          // Add plugin/theme header only if it doesn't exist and it's the main file
          const fullCode =
            hasHeader || !isMainFile
              ? file.code
              : type === 'plugin'
                ? `<?php\n/*\nPlugin Name: ${name}\nDescription: ${description}\nVersion: 1.0\n*/\n\n${file.code}`
                : `<?php\n/*\nTheme Name: ${name}\nDescription: ${description}\nVersion: 1.0\n*/\n\n${file.code}`;

          return {
            path:
              type === 'plugin'
                ? `/wordpress/wp-content/plugins/${file.path}`
                : `/wordpress/wp-content/themes/${file.path}`,
            code: fullCode,
          };
        }),
      );

      return JSON.stringify({
        type,
        name,
        description,
        files: results,
        success: true,
        message: `Successfully generated ${type} "${name}" with ${files.length} files`,
      });
    } catch (error: unknown) {
      console.error('Error generating WordPress code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return JSON.stringify({
        success: false,
        message: `Failed to generate ${type}: ${errorMessage}`,
      });
    }
  },
});

export { codeGenerator };
