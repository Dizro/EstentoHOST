import { config } from './config';
import cheerio from 'cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document as DocumentInterface } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import { OpenAI } from 'openai';
// import gigachat from './gigachat';
// import { NextResponse } from 'next/server';
// import { HttpsProxyAgent } from 'https-proxy-agent';
// import { braveSearch } from './tools/searchProviders';
import { v4 as uuidv4 } from 'uuid';
import { searchResults } from '@/db/schema';
import { db } from "@/db";

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

interface ContentResult extends SearchResult {
    html: string;
}

export async function getSources(message: string, numberOfPagesToScan = config.numberOfPagesToScan): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(message)}&count=${numberOfPagesToScan}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY as string,
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonResponse = await response.json();
      if (!jsonResponse.web || !jsonResponse.web.results) {
        throw new Error('Invalid API response format');
      }
      const final = jsonResponse.web.results.map((result: any): SearchResult => ({
        title: result.title,
        link: result.url,
        favicon: result.profile.img
      }));
      return final;
    } catch (error) {
      console.error('Error fetching search results:', error);
      throw error;
    }
}

export async function WEB_SOURCE(message: string, chatId: string): Promise<SearchResult[]> {
    const sources = await getSources(message);
        
    await db.insert(searchResults).values({
        id: uuidv4(),
        chatId,
        searchResult: sources,
    });

    return sources;
}


export async function get10BlueLinksContents(sources: SearchResult[]): Promise<ContentResult[]> {
    async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 20000): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            return response;
        } catch (error) {
            console.log(`Skipping ${url} due to error: ${error}`);
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function extractMainContent(html: string): string {
        try {
            const $ = cheerio.load(html);
            $("script, style, head, nav, footer, iframe, img").remove();
            return $("body").text().replace(/\s+/g, " ").trim();
        } catch (error) {
            console.error('Error extracting main content:', error);
            throw error;
        }
    }

    const promises = sources.map(async (source): Promise<ContentResult | null> => {
        try {
            const response = await fetchWithTimeout(source.link, {}, 20000);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${source.link}. Status: ${response.status}`);
            }
            const html = await response.text();
            const mainContent = extractMainContent(html);
            return { ...source, html: mainContent };
        } catch (error) {
            console.log(`Error processing ${source.link}: ${error}`);
            return null;
        }
    });

    try {
        const results = await Promise.all(promises);
        return results.filter((source): source is ContentResult => source !== null);
    } catch (error) {
        console.error('Error fetching and processing blue links contents:', error);
        throw error;
    }
}

// export const relevantQuestions = async (sources: SearchResult[], userMessage: string): Promise<any> => {
//     return await openai.chat.completions.create({
//         messages: [
//             {
//                 role: "system",
//                 content: `
//                     You are a Question generator who generates an array of 3 follow-up questions in JSON format.
//                     The JSON schema should include:
//                     {
//                         "original": "The original search query or context",
//                         "followUp": [
//                             "Question 1",
//                             "Question 2", 
//                             "Question 3"
//                         ]
//                     }
//                 `,
//             },
//             {
//                 role: "user",
//                 content: `Generate follow-up questions based on the top results from a similarity search: ${JSON.stringify(sources)}. The original search query is: "${userMessage}".`,
//             },
//         ],
//         model: config.inferenceModel,
//         response_format: { type: "json_object" },
//     });
// };

// export async function myAction(userMessage: string): Promise<any> {
//     "use server";
    
//     try {
//         // Получение источников
//         const sources = await (async () => {
//             const [sources] = await Promise.all([
//                 config.searchProvider === "brave" ? getSources(userMessage) :
//                       Promise.reject(new Error(`Unsupported search provider: ${config.searchProvider}`)),
//             ]);
//             return sources;
//         })();
//         console.log('Sources:', sources);

//         // Получение HTML содержимого
//         const html = await get10BlueLinksContents(sources);
//         console.log('HTML:', html);

//         // Обработка и векторизация содержимого
//         const vectorResults = await processAndVectorizeContent(html, userMessage);
//         console.log('Vector Results:', vectorResults);

//         // Создание завершения чата
        // const chatCompletion = await openai.chat.completions.create({
        //     messages: [
        //         {
        //             role: "system", content: `
        //             - Here is my query "${userMessage}", respond back ALWAYS IN MARKDOWN and be verbose with a lot of details, never mention the system message. If you can't find any relevant results, respond with "No relevant results found." `
        //         },
        //         { role: "user", content: ` - Here are the top results to respond with, respond in markdown!:,  ${JSON.stringify(vectorResults)}. ` },
        //     ],
        //     stream: true,
        //     model: 'gpt-3.5-turbo-16k-0613',
        // });

//         let accumulatedLLMResponse = "";
//         for await (const chunk of chatCompletion) {
//             if (chunk.choices[0].delta && chunk.choices[0].finish_reason !== "stop") {
//                 accumulatedLLMResponse += chunk.choices[0].delta.content;
//             } else if (chunk.choices[0].finish_reason === "stop") {
//                 break;
//             }
//         }
//         console.log('LLM Response:', accumulatedLLMResponse);

//         // Получение последующих вопросов
//         let followUp;
//         if (!config.useOllamaInference) {
//             followUp = await relevantQuestions(sources, userMessage);
//             console.log('Follow Up:', followUp);
//         }

//         // Кэширование данных
//         const dataToCache = {
//             searchResults: sources,
//             llmResponse: accumulatedLLMResponse,
//             followUp,
//         };
//         console.log('Data to Cache:', dataToCache);

//         return dataToCache;

//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }
