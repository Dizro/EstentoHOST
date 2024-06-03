import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ui/ChatSideBar";
import {getLocale, getTranslations} from 'next-intl/server';
import ChatComponent from "@/components/ui/ChatComponent";

type Props = {
    params: {
        chatId: string;
    }
};

const ChatPage = async ({ params: { chatId } }: Props) => {
    const { isAuthenticated, getUser } = await getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();
    const locale = await getLocale();
    const t = await getTranslations("Main");
    if (!isAuthed || !user) {
        return redirect("/api/auth/login?");
    }
    const translations = {
        contacts: t("contacts"),
        developer: t("developer"),
        chat_history: t("chat_history"),
        please_log_in: t("please_log_in"),
        no_chats: t("no_chats"),

        inverted_index: t("inverted_index"),
        keyword_matching: t("keyword_matching"),
        semantic_ranking: t("semantic_ranking"),
        nlp_usage: t("nlp_usage"),
        vector_search: t("vector_search"),
        complex_query_processing: t("complex_query_processing"),
        performance_optimization: t("performance_optimization"),
        fast_query_processing: t("fast_query_processing"),
    };
    const _chats = await db.select().from(chats).where(eq(chats.userId, user.id));
    if (!_chats) {
        return redirect("/");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSideBar chats={_chats} chatId={chatId} locale={locale} isAuthenticated={!!user} showBackIcon={true} translations={translations}/>
            <div className="flex-1 flex flex-col">
                <ChatComponent chatId={chatId} />
            </div>
        </div>
    );
};

export default ChatPage;
