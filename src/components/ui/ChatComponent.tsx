"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import MessageList from "./MessageList";
import axios from "axios";
import axiosRetry from 'axios-retry';
import { Message } from "ai";
import { useQuery } from "react-query";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Document as DocumentInterface } from 'langchain/document';
import Image from 'next/image';

import loading from '../../../public/loading.svg';

type Props = {
    chatId: string;
};

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

interface ContentResult extends SearchResult {
    html: string;
}

axiosRetry(axios, {
    retries: 3,
    retryCondition: (error) => {
        return error.response?.status === 500 || error.response?.status === 429;
    },
    retryDelay: (retryCount) => {
        const delay = Math.pow(2, retryCount) * 100; // Exponential backoff
        const jitter = Math.random() * 100; // Jitter
        return delay + jitter;
    },
});

// интерфейс для пропсов компонента LoadingComponent
interface LoadingComponentProps {
    message: string;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-screen">
        <Image src={loading} alt="..." className="h-5 w-5 animate-spin" />
        <p className="mt-2 text-lg font-semibold">{message}</p>
    </div>
);


const ChatComponent = ({ chatId }: Props) => {
    const [isSourcesVisible, setIsSourcesVisible] = useState(false);
    const [sourcesData, setSourcesData] = useState<SearchResult[] | null>(null);
    const [searchResultId, setSearchResultId] = useState<string | null>(null);
    const [isLoadingSources, setIsLoadingSources] = useState(true);
    const [sourcesError, setSourcesError] = useState<Error | null>(null);

    const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const response = await axios.post<{
                messages: Message[],
                model: string,
                first_message: string,
                web_sourse_search: string
            }>('/api/get-messages', { chatId });
            return response.data;
        },
        enabled: !!chatId,
    });

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = await axios.post<{ sources: SearchResult[], searchResultId: string }>('/api/get-source', {
                    chatId,
                    message: messagesData?.first_message,
                    web_sourse_search: messagesData?.web_sourse_search
                });
                setSourcesData(response.data.sources);
                setSearchResultId(response.data.searchResultId);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setSourcesError(new Error(`HTTP error! status: ${error.response?.status}`));
                } else {
                    setSourcesError(error as Error);
                }
            } finally {
                setIsLoadingSources(false);
            }
        };

        if (messagesData?.first_message) {
            fetchSources();
        }
    }, [chatId, messagesData?.first_message]);

    const { data: _10LinksData, isLoading: isLoading10Links } = useQuery({
        queryKey: ["10Links", searchResultId, sourcesData],
        queryFn: async () => {
            const response = await axios.post<{ _10Links: ContentResult[], htmlContentId: string }>('/api/get-10-links', {
                searchResultId,
                source: sourcesData
            });
            return response.data;
        },
        enabled: !!searchResultId && !!sourcesData,
    });

    const htmlcontentId = _10LinksData?.htmlContentId;
    const _10linksSource = _10LinksData?._10Links;
    const message_embeddings = messagesData?.first_message;

    const { data: embeddings, isLoading: isLoadingEmbeddings } = useQuery({
        queryKey: ["Embeddings", htmlcontentId, _10linksSource, message_embeddings],
        queryFn: async () => {
            const response = await axios.post<{ vectorResults: DocumentInterface<Record<string, any>>[] }>('/api/create-embeddings', {
                htmlId: htmlcontentId,  
                _10links: _10linksSource,
                message: message_embeddings
            });
            return response.data;
        },
        enabled: !!htmlcontentId && !!_10linksSource && !!message_embeddings,
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isFirstMessageSentRef = useRef(false);

    const { input, handleInputChange, handleSubmit, messages, append, isLoading: LOADING_CHAT } = useChat({
        api: '/api/chat',
        body: {
            chatId,
            model: messagesData?.model || 'llama3-70b-8192',
            emdedding: embeddings?.vectorResults,
        },
        initialMessages: messagesData?.messages || [],
    });

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!isLoadingMessages && !isLoadingSources && !isLoading10Links && !isLoadingEmbeddings && messagesData?.messages?.length === 0 && !isFirstMessageSentRef.current) {
            isFirstMessageSentRef.current = true;
            if (messagesData?.first_message) {
                setTimeout(() => {
                    append({
                        role: "user",
                        content: messagesData.first_message,
                    });
                }, 1000); // 1 second delay
            }
        }
    }, [isLoadingMessages, isLoadingSources, isLoading10Links, isLoadingEmbeddings, messagesData, append]);

    if (isLoadingMessages) {
        return <LoadingComponent message="Загружаем сообщения..." />;
    }
    
    if (isLoadingSources) {
        return <LoadingComponent message="Загружаем источники..." />;
    }
    
    if (isLoading10Links) {
        return <LoadingComponent message="Загружаем ссылки..." />;
    }
    
    if (isLoadingEmbeddings) {
        return <LoadingComponent message="Создаем эмбеддинги..." />;
    }
    
    if (sourcesError) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 text-lg font-semibold">Error: {sourcesError.message}</p>
            </div>
        );
    }

    const sources = sourcesData || [];

    return (
        <div className="flex-1 h-full flex flex-col gap-4 mt-4 p-4 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out">
            <div className="text-lg font-semibold">Model: {messagesData?.model}</div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                <MessageList messages={messages} isLoading={LOADING_CHAT} sources={sources} />
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring transition-all duration-300 ease-in-out">
                <Label htmlFor="message" className="sr-only">
                    Message
                </Label>
                <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                    value={input}
                    onChange={handleInputChange}
                />
                <div className="flex items-center p-3 pt-0">
                    <Button type="submit" size="sm" className="ml-auto gap-1.5">
                        Send Message
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatComponent;
