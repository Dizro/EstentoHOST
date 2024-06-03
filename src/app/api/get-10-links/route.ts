import { v4 as uuidv4 } from 'uuid';
import { htmlContents, searchResults } from '@/db/schema';
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { get10BlueLinksContents } from '@/lib/context';

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

interface ContentResult extends SearchResult {
    html: string;
}

export const POST = async (req: Request): Promise<NextResponse> => {
    try {
        const { searchResultId, source } = await req.json();

        // проверка на уникальность в бд
        const existingRecords = await db.select().from(htmlContents).where(eq(htmlContents.searchResultId, searchResultId));
        const existingRecord = existingRecords.length > 0 ? existingRecords[0] : null;

        if (existingRecord) {
            // если запись есть то возвращаем
            return NextResponse.json({ _10Links: JSON.parse(existingRecord.htmlSource) });
        }

        const _10Links = await get10BlueLinksContents(source);

        if (!_10Links || _10Links.length === 0) {
            return NextResponse.json({ error: "Sources not found" }, { status: 404 });
        }

        const _10LinksString = JSON.stringify(_10Links);

        const htmlContentId = await db.insert(htmlContents).values({
            id: uuidv4(),
            searchResultId,
            htmlSource: _10LinksString,
        }).returning({
            insertedId: htmlContents.id,
        });

        return NextResponse.json({ _10Links, htmlContentId: htmlContentId[0].insertedId });

    } catch (error) {
        console.error("Error fetching sources:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
