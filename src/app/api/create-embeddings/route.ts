import { v4 as uuidv4 } from 'uuid';
import { vectorizedContents } from '@/db/schema';
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { get10BlueLinksContents } from '@/lib/context';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document as DocumentInterface } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

interface ContentResult extends SearchResult {
    html: string;
}

const agent = new HttpsProxyAgent(proxy);

const embeddings = new OpenAIEmbeddings({
    verbose: true,
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large",
});

async function processAndVectorizeContent(
    contents: ContentResult[],
    query: string,
    textChunkSize = 1000,
    textChunkOverlap = 400,
    numberOfSimilarityResults = 1,
): Promise<DocumentInterface[]> {
    const allResults: DocumentInterface[] = [];
    try {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            if (content.html.length > 0) {
                try {
                    const splitText = await new RecursiveCharacterTextSplitter({ chunkSize: textChunkSize, chunkOverlap: textChunkOverlap }).splitText(content.html);
                    const vectorStore = await MemoryVectorStore.fromTexts(splitText, { title: content.title, link: content.link }, embeddings);
                    const contentResults = await vectorStore.similaritySearch(query, numberOfSimilarityResults);
                    allResults.push(...contentResults);
                } catch (error) {
                    console.error(`Error processing content for ${content.link}:`, error);
                }
            }
        }
        return allResults;
    } catch (error) {
        console.error('Error processing and vectorizing content:', error);
        throw error;
    }
}

export const POST = async (req: Request): Promise<NextResponse> => {
    try {
        const { htmlId, _10links, message } = await req.json();

        // Check if the search result already exists in the database
        const existingRecords = await db.select().from(vectorizedContents).where(eq(vectorizedContents.htmlContentId, htmlId));
        const existingRecord = existingRecords.length > 0 ? existingRecords[0] : null;

        const vectorStoreString = existingRecord?.vectorStore as string;

        if (existingRecord) {
            // If the record already exists, return it
            return NextResponse.json({ _10Links: vectorStoreString });
        }

        const vectorResults = await processAndVectorizeContent(_10links, message);

        await db.insert(vectorizedContents).values({
            id: uuidv4(),
            htmlContentId: htmlId,
            vectorStore: vectorResults,
        });

        return NextResponse.json({ vectorResults });

    } catch (error) {
        console.error("Error fetching sources:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
