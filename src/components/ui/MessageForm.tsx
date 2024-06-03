'use client';

import { FormEventHandler, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import axios from "axios";

import {
  CornerDownLeft,
  LoaderCircle,
  Earth,
} from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import llama3 from '../../../public/llama.png'; 
import openai_logo from '../../../public/openai.png';
import giga_chat from '../../../public/gigachat.png';

import github from '../../../public/github.png'; 
import vk from '../../../public/vk.png';
import internet from '../../../public/earth.png';
import ishitr from '../../../public/ishitr.png';
import Image from 'next/image';
import { useMutation } from "react-query";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ExampleForm extends HTMLFormElement {
    message: HTMLTextAreaElement;
}

interface MessageFormProps {
    translations: {
      title: string;
      titleTextarea: string;
      titleSendMessage: string;
      selectModel: string;
      llama3Depiction: string;
      gpt4oDepiction: string;
      mixtralDepiction: string;
      selectSource: string;

      select_model_source_query: string;
      enter_query_source: string;
      enter_query_model: string;
      select_model_source: string
      enter_query: string;

      select_model_only: string;
    };
    locale: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ translations, locale }) => {
    const [selectedModel, setSelectedModel] = useState<string>('gpt-4o'); // Default model
    const [selectedSource, setSelectedSource] = useState<string>('WEB'); // Default source
    const [message, setMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ message, model, source }: { message: string; model: string; source: string; }) => {
            const response = await axios.post("/api/create-chat", { message, model, source });
            return response.data;
        },
    });

    const handleSubmit: FormEventHandler<ExampleForm> = useCallback(async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (selectedModel && selectedSource && message) {
            mutation.mutate({ message, model: selectedModel, source: selectedSource}, {
                onSuccess: ({ chat_id }) => {
                    router.push(`/${locale}/chat/${chat_id}`);
                },
                onError: (error) => {
                    const errorObject = error as { response: { status: number } };
                    if (errorObject.response && errorObject.response.status === 401) {
                        toast.error("Unauthorized. Please log in.", {
                            position: "bottom-left",
                            theme: "colored"
                        });
                    } else if (errorObject.response && errorObject.response.status === 500) {
                        toast.error("Internal server error. Please try again later.", {
                            position: "bottom-left"
                        });
                    } else {
                        toast.error("An error occurred. Please try again later.", {
                            position: "bottom-left"
                        });
                    }
                    console.error("Error creating chat:", error);
                    setIsSubmitting(false);
                },
            });
        } else {
            let warningMessage = translations.select_model_source_query;
            if (selectedModel && !selectedSource && !message) {
                warningMessage = translations.enter_query_source;
            } else if (!selectedModel && selectedSource && !message) {
                warningMessage = translations.enter_query_model;
            } else if (!selectedModel && !selectedSource && message) {
                warningMessage = translations.select_model_source;
            } else if (selectedModel && selectedSource && !message) {
                warningMessage = translations.enter_query;
            } else if (selectedModel && !selectedSource && message) {
                warningMessage = translations.selectSource;
            } else if (!selectedModel && selectedSource && message) {
                warningMessage = translations.select_model_only;
            }
            toast.warn(warningMessage, {
                position: "bottom-left"
            });
            setIsSubmitting(false);
        }
    }, [selectedModel, selectedSource, message, mutation, router, locale]);

    return (
        <><form onSubmit={handleSubmit} className="w-full max-w-[35rem] shadow search-bar-input-group p-3 border rounded-lg bg-background focus-within:ring-1 focus-within:ring-blue-500">
            <Label htmlFor="message" className="sr-only">Message</Label>
            <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={translations.titleTextarea}
                className="min-h-12 border-0 resize-none shadow-none focus-visible:ring-offset-0 focus-visible:ring-0 textarea-custom" />
            <div className="flex items-center justify-between mt-4">
                <div className='mr-4'>
                <Select onValueChange={setSelectedModel}>
                    <SelectTrigger id="model" className="items-start [&_[data-description]]:hidden w-55 border-none">
                        <SelectValue placeholder={translations.selectModel}/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gpt-4o" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <Image src={openai_logo} alt='gpt-4o' className='size-5 fill-white' priority loading={"eager"}/>
                                <div className="grid gap-0.5">
                                    <p>
                                        EstentoSearch + {" "}
                                        <span className="font-medium text-foreground">
                                            GPT-4o
                                        </span>
                                    </p>
                                    <p className="text-xs" data-description>
                                        {translations.gpt4oDepiction}
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="GigaChat" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <Image src={giga_chat} alt='mistral8b' className='size-5 fill-white' priority loading={"eager"}/>
                                <div className="grid gap-0.5">
                                    <p>
                                        EstentoSearch + {" "}
                                        <span className="font-medium text-foreground">
                                            GigaChat
                                        </span>
                                    </p>
                                    <p className="text-xs" data-description>
                                        {translations.mixtralDepiction}
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <Select onValueChange={setSelectedSource}>
                    <SelectTrigger id="source" className="items-start [&_[data-description]]:hidden w-55 border-none">
                        <SelectValue placeholder={translations.selectSource}/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="WEB" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                             <Earth className='size-5'/>
                                <div className="grid gap-0.5">
                                    <p className="text-xs" data-description>
                                        All Internet
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="Github" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <Image src={github} alt='Github' className='size-5 fill-white' priority loading={"eager"}/>
                                <div className="grid gap-0.5">
                                    <p className="text-xs" data-description>
                                        Github
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="VK" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <Image src={vk} alt='VK' className='size-5 fill-white' priority loading={"eager"}/>
                                <div className="grid gap-0.5">
                                    <p className="text-xs" data-description>
                                        Vkontakte
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="TPU" className="cursor-pointer">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <Image src={ishitr} alt='TPU' className='size-5 fill-white' priority loading={"eager"}/>
                                <div className="grid gap-0.5">
                                    <p className="text-xs" data-description>
                                        Tomsk Polytechnic University
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" disabled={isSubmitting} className="ml-auto flex items-center gap-2">
                    {isSubmitting ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <CornerDownLeft className="h-4 w-4" />
                        </>
                    )}
                </Button>
                </div>
        </form><ToastContainer /></>
    );
}
export default MessageForm;