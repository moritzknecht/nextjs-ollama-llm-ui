import { createOllama } from 'ollama-ai-provider';
import { streamText, convertToCoreMessages, CoreMessage, UserContent, tool } from 'ai';

import { fetch_url, search_web } from '../lib/tools';
export const runtime = "edge";
export const dynamic = "force-dynamic";




export async function POST(req: Request) {
  // Destructure request data
  const { messages, selectedModel, data } = await req.json();

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  const ollama = createOllama({});

  // Build message content array directly
  const messageContent: UserContent = [{ type: 'text', text: currentMessage.content }];

  // Add images if they exist
  data?.images?.forEach((imageUrl: string) => {

    const image = imageUrl
    console.log(image);
    messageContent.push({ type: 'image', image });
  });
  let tools = undefined
  if (currentMessage.content.includes('https://')) {
    tools = { fetch_url }
  }

  // Stream text using the ollama model
  const result = await streamText({
    model: ollama(selectedModel),
    tools,
    messages: [
      ...convertToCoreMessages(initialMessages),
      { role: 'user', content: messageContent },
    ],
    maxSteps: 5,

  },);

  return result.toDataStreamResponse();
}
