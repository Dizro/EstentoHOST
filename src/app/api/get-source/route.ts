import { v4 as uuidv4 } from 'uuid';
import { searchResults } from '@/db/schema';
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSources } from '@/lib/context';

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

export const POST = async (req: Request): Promise<NextResponse> => {
    try {
        const { chatId, message, web_sourse_search } = await req.json();

        // Проверка на существование записи в базе данных
        const existingRecords = await db.select().from(searchResults).where(eq(searchResults.chatId, chatId));
        const existingRecord = existingRecords.length > 0 ? existingRecords[0] : null;

        if (existingRecord) {
            // Если запись уже существует, возвращаем её
            return NextResponse.json({ sources: existingRecord.searchResult });
        }

        let result_message: string;

        if (web_sourse_search === "WEB") {
            result_message = `${message}`;
        } else if (web_sourse_search === "Github") {
            result_message = `${message} + github.com`;
        } else if (web_sourse_search === "VK") {
            result_message = `${message} + vk.com`;
        } else if (web_sourse_search === "TPU") {
            result_message = `${message} + Tomsk Polytechnic University`;
        } else {
            result_message = `${message}`;
        }
        
        // Если записи нет, выполняем запрос и сохраняем результат
        const sources = await getSources(result_message);
        
        const searchResult = await db.insert(searchResults).values({
            id: uuidv4(),
            chatId,
            searchResult: sources,
        }).returning({
            insertedId: searchResults.id,
        });

        if (!sources) {
            return NextResponse.json({ error: "Sources not found" }, { status: 404 });
        }

        return NextResponse.json({ sources: sources, searchResultId: searchResult[0].insertedId});
    } catch (error) {
        console.error("Error fetching sources:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
