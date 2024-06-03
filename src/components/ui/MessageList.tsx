"use client";
import React from "react";
import { Message } from "ai/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { marked } from "marked";

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

type Props = {
    isLoading: boolean,
    messages: Message[],
    sources: SearchResult[],
};

const MessageList = ({ messages, isLoading, sources }: Props) => {
    return (
        <div className="flex flex-col gap-2 px-4">
            {messages.map((message) => (
                <div key={message.id} className={cn('flex', {
                    'justify-end pl-10': message.role === 'user',
                    'justify-start pr-10': message.role === 'assistant'
                })}>
                    <div className={cn("rounded-lg px-3 text-sm py-1 ring-1", {
                        'bg-blue-600 text-white': message.role === 'user',
                        'bg-gray-200 text-black': message.role === 'assistant'
                    })}>
                        <div dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                        {message.role === 'assistant' && sources.length > 0 && (
                            <ul className="mt-2">
                                {sources.map((source, index) => (
                                    <li key={index} className="mb-2">
                                        <a href={source.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
                                            <img src={source.favicon} alt={`${source.title} favicon`} className="w-4 h-4 mr-2" />
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start pr-10">
                    <div className="rounded-lg px-3 text-sm py-1 ring-1">
                        <Loader2 className="animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageList;