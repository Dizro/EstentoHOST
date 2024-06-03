import {db} from "@/db"
import {chats, users} from "@/db/schema"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// api/create-chat
export async function POST(req: Request, res: Response) {
    const {isAuthenticated, getUser} = await getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();

    // Проверка на авторизацию пользователя!
    if (!isAuthed) {
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }

    if (!user?.id) {
        throw new Error("User ID is undefined");
    }

    try {
        const body = await req.json();
        const { message, model, source } = body;
        console.log(message, model, source);

        const chat_id = await db.insert(chats).values({
            id: uuidv4(),
            userId: user.id,
            content: message,
            model: model,
            source: source,
        }).returning({
            insertedId: chats.id,
        });

        return NextResponse.json({ chat_id: chat_id[0].insertedId }, { status: 200 });

    } catch (error) {

        console.error(error);
        
        return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
}