'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card";
import { BookMarked, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Image from 'next/image';
import meow from '../../../public/dog.gif';

const sections = (translations: any) => [
    {
        title: translations.inverted_index,
        description: translations.keyword_matching,
        imageSrc: meow // Заменить
    },
    {
        title: translations.semantic_ranking,
        description: translations.nlp_usage,
        imageSrc: meow // Заменить
    },
    {
        title: translations.vector_search,
        description: translations.complex_query_processing,
        imageSrc: meow // Заменить
    },
    {
        title: translations.performance_optimization,
        description: translations.fast_query_processing,
        imageSrc: meow // Заменить
    }
];


export default function InfoCard({ translations }: any) {
    const [currentSection, setCurrentSection] = useState(0);
    const sectionsData = sections(translations);

    const handleNext = () => {
        setCurrentSection((prev) => (prev + 1) % sectionsData.length);
    };

    const handlePrev = () => {
        setCurrentSection((prev) => (prev - 1 + sectionsData.length) % sectionsData.length);
    };

    return (
        <div className="md:flex">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Button
                        className="rounded-none text-white w-full text-left p-2"
                        size="icon"
                        variant="ghost"
                    >
                        <BookMarked className="w-5 h-5" />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent align="start" className="w-80" side="right">
                    <div className="flex flex-col items-center space-y-4">
                        <Image
                            alt="Information"
                            className="rounded-md"
                            height={200}
                            src={sectionsData[currentSection].imageSrc}
                            style={{
                                aspectRatio: "16/9",
                                objectFit: "cover",
                            }}
                            width={320}
                        />
                        <div className="space-y-2 text-center">
                            <h4 className="text-lg font-semibold">{sectionsData[currentSection].title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {sectionsData[currentSection].description}
                            </p>
                        </div>
                        <div className="flex w-full justify-between">
                            <Button size="icon" variant="ghost" onClick={handlePrev}>
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleNext}>
                                <ArrowRightIcon className="w-4 h-4" />
                                <span className="sr-only">Next</span>
                            </Button>
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    );
}