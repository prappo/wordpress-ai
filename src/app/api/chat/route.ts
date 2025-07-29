import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { codeGenerator } from '@/lib/tools/wordpress-generator';
import contentGenerator from '@/lib/tools/content-generator';
import { LangChainAdapter } from 'ai';
import { allPrompts, pluginPrompt, themePrompt, contentPrompt } from '@/lib/utils/prompt';
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, customer, project } = await req.json();

  let prompt = allPrompts();

  if (project.type === 'Plugin') {
    prompt = pluginPrompt();
  } else if (project.type === 'Theme') {
    prompt = themePrompt();
  } else if (project.type === 'Page Content') {
    prompt = contentPrompt();
  }

  if (!customer?.open_ai_api_key) {
    const sorryMessage =
      "I'm sorry, but I can't process your request because no OpenAI API key was provided. Please add your API on the  [settings page](/dashboard/settings).";
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(sorryMessage);
        controller.close();
      },
    });
    return LangChainAdapter.toDataStreamResponse(stream);
  }
  const openai = createOpenAI({
    apiKey: customer.open_ai_api_key,
  });

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: prompt,
    tools: {
      codeGenerator: codeGenerator,
      contentGenerator: contentGenerator,
    },
  });

  return result.toDataStreamResponse();
}
