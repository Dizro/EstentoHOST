import OpenAI from 'openai';
import { Message, OpenAIStream, StreamingTextResponse } from 'ai';
import { chats, messages as _messages, searchResults } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { NextResponse } from 'next/server';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.BASE_URL,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
  }

const relevantQuestions = async (sources: SearchResult[], userMessage: String): Promise<any> => {
    return await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            You are a Question generator who generates an array of 3 follow-up questions in JSON format.
            The JSON schema should include:
            {
              "original": "The original search query or context",
              "followUp": [
                "Question 1",
                "Question 2", 
                "Question 3"
              ]
            }
            `,
        },
        {
          role: "user",
          content: `Generate follow-up questions based on the top results from a similarity search: ${JSON.stringify(sources)}. The original search query is: "${userMessage}".`,
        },
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });
  };

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { messages, chatId, model, emdedding } = await req.json();

        // Проверка существования чата
        const chatRecords = await db.select().from(chats).where(eq(chats.id, chatId));
        if (chatRecords.length !== 1) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const lastMessage = messages[messages.length - 1];

        const prompt =
            [{
              role: 'system',
              content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            The AI assistant is a development by "Estento AI".
            START CONTEXT BLOCK
            ${JSON.stringify(emdedding)}
            END OF CONTEXT BLOCK
            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `,
            },]
        
        // Определение модели для использования
        const selectedModel = "gpt-3.5-turbo";

        const response = await openai.chat.completions.create({
            model: selectedModel,
            stream: true,
            messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
        });

        // Обработка потокового ответа
        const stream = OpenAIStream(response, {
            onStart: async () => {
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage.content,
                    role: 'user',
                });
            },
            onCompletion: async (completion) => {
                await db.insert(_messages).values({
                    chatId,
                    content: completion,
                    role: 'system',
                });
            },
        });

        return new StreamingTextResponse(stream);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
