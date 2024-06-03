import OpenAI from "openai";
import fetch from "node-fetch";
import {title_ai_texts} from "@/db/schema";
import { db } from "@/db/index";

import dotenv from 'dotenv'
dotenv.config();

async function fetchSearchResults(query: any) {
    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query,
                search_depth: "based",
                include_answer: true,
                include_images: false,
                include_raw_content: false,
                max_results: 20,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка при получении результатов поиска: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Не удалось получить результаты поиска:", error);
        throw error;
    }
}

async function getOpenAICompletion(responseJson: any, query: any) {
    try {
        const openai = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: process.env.BASE_URL });

        const jsonData = `{
            "Text": [
              {
                "english": "Show me software engineers who work with React and live in Bengaluru, but are open to remote work.",
                "russian": "",
                "chinese": ""
              },
              {
                "english": "Find fintech companies in Germany who recently raised a Series A round.",
                "russian": "", 
                "chinese": ""
              },
              {
                "english": "What are top competitors of the Grab company in Malaysia and their financials for the year 2023?",
                "russian": "",
                "chinese": ""
              }
            ]
          }`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Summarize the following JSON to answer the research query \`"${query}"\`: ${JSON.stringify(responseJson)} in plain English.`,
                },
                {
                    role: "user",
                    content: `Identify one news item from the field of science, one from the field of job search and ONE!! - (from the field of Tomsk Polytechnic University) from the text provided. Format each item as a concise query and user question. Ensure brevity. Queries must come from a research query. Buying something, Searching for something, What is such and such technology, The best of something and so on! Each query should be translated into both Chinese and Russian. Present the results in JSON format as shown below: ${jsonData}`,
                },
            ],
            model: "gpt-3.5-turbo",
            response_format: {
                type: "json_object"
            },
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Не удалось получить завершение OpenAI:", error);
        throw error;
    }
}

export default async function research(query: any) {
    try {
        const searchResults = await fetchSearchResults(query);

        const completion = await getOpenAICompletion(searchResults, query);

        const results = JSON.parse(completion!);
        console.log(results);
        return results;

    } catch (error) {
        console.error("Исследование не удалось:", error);
        throw error;
    }
}