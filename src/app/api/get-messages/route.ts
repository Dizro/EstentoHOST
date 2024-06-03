import { db } from "@/db";
import { messages, chats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server"; 

export const POST = async (req: Request): Promise<NextResponse> => {
    try {
        const { chatId } = await req.json();

        if (!chatId) {
            return NextResponse.json({ error: "chatId is required" }, { status: 400 });
        }

        const _messages = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId));

        const chatResult = await db
            .select()
            .from(chats)
            .where(eq(chats.id, chatId));

        const chat = chatResult[0];

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json({ messages: _messages, model: chat.model, first_message: chat.content, web_sourse_search: chat.source });
    } catch (error) {
        console.error("Error fetching messages and model:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
