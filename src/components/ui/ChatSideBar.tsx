'use client';

import React from "react";
import { DrizzleChat } from "@/db/schema";
import Link from "next/link";
import { MessageSquare, ArrowBigLeft } from "lucide-react";
import InfoCard from '@/components/ui/info_card';

type Props = {
  chats: DrizzleChat[];
  chatId: string;
  locale: string;
  isAuthenticated: any;
  showBackIcon: boolean;
  translations: {
    contacts: string;
    developer: string;
    chat_history: string;
    please_log_in: string;
    no_chats: string;

    inverted_index: string;
    keyword_matching: string;
    semantic_ranking: string;
    nlp_usage: string;
    vector_search: string;
    complex_query_processing: string;
    performance_optimization: string;
    fast_query_processing: string;
  };
};

const ChatSideBar = ({ chats, locale, chatId, isAuthenticated, showBackIcon, translations }: Props) => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-700 hidden md:flex flex-col gap-2 text-white h-full w-64">
      <div className="sticky top-0 p-4 bg-gray-800 shadow-lg rounded-b-lg flex items-center">
        {showBackIcon && (
          <Link href="/" className="flex items-center justify-center p-2 hover:bg-gray-900 hover:text-white rounded-md transition-colors duration-200 mr-2">
            <ArrowBigLeft className="h-6 w-6" />
          </Link>
        )}
        <div className="grow text-ellipsis overflow-hidden whitespace-nowrap text-lg font-semibold">{translations.chat_history}</div>
      </div>
      <div className="overflow-auto flex-1 smooth-scroll p-3" style={{ maxHeight: 'calc(76vh - 110px)' }}>
        {isAuthenticated ? (
          <div className="grid gap-2">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/${locale}/chat/${chat.id}`}
                  className={`truncate overflow-hidden flex-1 text-base transition-colors rounded-lg whitespace-nowrap p-3 block ${
                    chat.id === chatId
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">
                      {chat.content.length > 30
                        ? `${chat.content.slice(0, 30)}...`
                        : chat.content}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-400">{translations.no_chats}</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">{translations.please_log_in}</div>
        )}
      </div>
      <div className="mt-auto p-4 bg-gray-800 shadow-lg rounded-t-lg text-center">
        <div className="text-gray-400 text-sm font-medium px-2 mb-2">{translations.contacts}</div>
        <Link
          href="https://t.me/thedizro"
          className="truncate overflow-hidden flex-1 text-base transition-colors rounded-lg whitespace-nowrap p-3 block font-bold hover:bg-gray-700 hover:text-white mb-2"
          prefetch={false}
        >
          {translations.developer}
        </Link>
        <InfoCard translations={translations}/>
      </div>
    </div>
  );
};

export default ChatSideBar;
